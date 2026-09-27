package server

import (
	"bufio"
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log/slog"
	"net"
	"runtime/debug"
	"sync"
	"time"

	"github.com/zeusnotfound04/nano-mail/database"
	"github.com/zeusnotfound04/nano-mail/internal/config"
	"github.com/zeusnotfound04/nano-mail/internal/limiter"
	"github.com/zeusnotfound04/nano-mail/pkg/message"
)

const (
	acceptRetryMinDelay = 5 * time.Millisecond
	acceptRetryMaxDelay = 1 * time.Second
	forceCloseTimeout   = 2 * time.Second
)

type storeFunc func(ctx context.Context, msg *message.Message) (int64, error)

type Server struct {
	config *config.Config

	listener     net.Listener
	shutdown     chan struct{}
	shutdownOnce sync.Once
	wg           sync.WaitGroup
	db           *sql.DB
	rateLimiter  limiter.ConnectionLimiter
	store        storeFunc

	connMu sync.Mutex
	conns  map[net.Conn]struct{}
}

func NewServer(cfg *config.Config, db *sql.DB) *Server {
	if cfg == nil {
		cfg = config.DefaultConfig()
	}
	if cfg.Logger == nil {
		cfg.Logger = slog.Default()
	}
	cfg.Normalize()

	maxPerIP := 10
	if cfg.ConnectionPerIP > 0 {
		maxPerIP = cfg.ConnectionPerIP
	}

	maxTotal := 1000
	if cfg.MaxConnections > 0 {
		maxTotal = cfg.MaxConnections
	}

	s := &Server{
		config:      cfg,
		shutdown:    make(chan struct{}),
		rateLimiter: limiter.NewRateLimiter(maxPerIP, maxTotal),
		db:          db,
		conns:       make(map[net.Conn]struct{}),
	}

	s.store = func(ctx context.Context, msg *message.Message) (int64, error) {
		return database.StoreMail(ctx, s.db, msg)
	}

	return s
}

func (s *Server) Start() error {
	addr := net.JoinHostPort(s.config.Host, s.config.Port)

	listener, err := net.Listen("tcp", addr)
	if err != nil {
		return fmt.Errorf("failed to start SMTP server: %w", err)
	}
	s.listener = listener

	s.config.Logger.Info("SMTP server started",
		"addr", addr,
		"domain", s.config.Domain,
		"allowedDomains", s.config.AllowedDomains)

	s.wg.Add(1)
	go s.acceptConnections()

	if s.db != nil && s.config.RetentionPeriod > 0 && s.config.RetentionInterval > 0 {
		s.wg.Add(1)
		go s.runRetention()
	}

	return nil
}

func (s *Server) stopping() bool {
	select {
	case <-s.shutdown:
		return true
	default:
		return false
	}
}

func (s *Server) acceptConnections() {
	defer s.wg.Done()

	var delay time.Duration

	for {
		conn, err := s.listener.Accept()
		if err != nil {
			if s.stopping() || errors.Is(err, net.ErrClosed) {
				return
			}

			switch {
			case delay == 0:
				delay = acceptRetryMinDelay
			case delay < acceptRetryMaxDelay:
				delay *= 2
			}
			if delay > acceptRetryMaxDelay {
				delay = acceptRetryMaxDelay
			}

			s.config.Logger.Error("Failed to accept connection, retrying",
				"error", err,
				"retryIn", delay.String())

			select {
			case <-time.After(delay):
			case <-s.shutdown:
				return
			}

			continue
		}

		delay = 0

		remoteIP, _, err := net.SplitHostPort(conn.RemoteAddr().String())
		if err != nil {
			remoteIP = conn.RemoteAddr().String()
		}

		if !s.rateLimiter.Allow(remoteIP) {
			s.config.Logger.Warn("Connection limit exceeded", "ip", remoteIP)
			conn.SetWriteDeadline(time.Now().Add(s.config.WriteTimeout))
			conn.Write([]byte("421 Too many connections from your IP\r\n"))
			conn.Close()
			continue
		}

		s.wg.Add(1)
		go func(c net.Conn, ip string) {
			defer s.wg.Done()
			defer s.rateLimiter.Release(ip)
			s.handleConnection(c)
		}(conn, remoteIP)
	}
}

func (s *Server) trackConn(conn net.Conn) {
	s.connMu.Lock()
	defer s.connMu.Unlock()

	s.conns[conn] = struct{}{}
}

func (s *Server) untrackConn(conn net.Conn) {
	s.connMu.Lock()
	defer s.connMu.Unlock()

	delete(s.conns, conn)
}

func (s *Server) closeActiveConns() int {
	s.connMu.Lock()
	defer s.connMu.Unlock()

	for conn := range s.conns {
		conn.Close()
	}

	return len(s.conns)
}

func (s *Server) handleConnection(conn net.Conn) {
	s.trackConn(conn)
	defer s.untrackConn(conn)
	defer conn.Close()

	messageBuffer := getPooledBuffer()
	defer returnPooledBuffer(messageBuffer)

	remoteAddr := conn.RemoteAddr().String()

	defer func() {
		if r := recover(); r != nil {
			s.config.Logger.Error("Recovered from panic in SMTP session",
				"client", remoteAddr,
				"panic", r,
				"stack", string(debug.Stack()))
		}
	}()

	session := &smtpSession{
		server:     s,
		conn:       conn,
		reader:     bufio.NewReader(conn),
		writer:     bufio.NewWriter(conn),
		state:      stateInit,
		recipients: make([]string, 0, s.config.MaxRecipients),
		message:    messageBuffer,
		remoteAddr: remoteAddr,
		ctx:        context.Background(),
	}

	greeting := fmt.Sprintf("220 %s ESMTP ready\r\n", s.config.Domain)
	if err := session.writeResponse(greeting); err != nil {
		s.config.Logger.Error("Failed to send greeting", "error", err, "client", remoteAddr)
		return
	}

	session.process()
}

func (s *Server) runRetention() {
	defer s.wg.Done()
	defer func() {
		if r := recover(); r != nil {
			s.config.Logger.Error("Recovered from panic in retention worker",
				"panic", r,
				"stack", string(debug.Stack()))
		}
	}()

	s.purgeExpired()

	ticker := time.NewTicker(s.config.RetentionInterval)
	defer ticker.Stop()

	for {
		select {
		case <-s.shutdown:
			return
		case <-ticker.C:
			s.purgeExpired()
		}
	}
}

func (s *Server) purgeExpired() {
	ctx, cancel := context.WithTimeout(context.Background(), s.config.RetentionTimeout)
	defer cancel()

	deleted, err := database.DeleteOldMails(ctx, s.db, s.config.RetentionPeriod)
	if err != nil {
		s.config.Logger.Error("Retention sweep failed", "error", err, "deleted", deleted)
		return
	}

	if deleted > 0 {
		s.config.Logger.Info("Retention sweep complete",
			"deleted", deleted,
			"olderThan", s.config.RetentionPeriod.String())
	}
}

func (s *Server) Stop(ctx context.Context) error {
	s.shutdownOnce.Do(func() {
		close(s.shutdown)
	})

	if s.listener != nil {
		s.listener.Close()
	}

	if s.rateLimiter != nil {
		s.rateLimiter.Cleanup()
	}

	drained := make(chan struct{})
	go func() {
		s.wg.Wait()
		close(drained)
	}()

	select {
	case <-drained:
		return nil
	case <-ctx.Done():
	}

	if active := s.closeActiveConns(); active > 0 {
		s.config.Logger.Warn("Grace period expired, closing active connections", "connections", active)
	}

	select {
	case <-drained:
	case <-time.After(forceCloseTimeout):
	}

	return fmt.Errorf("shutdown did not drain gracefully: %w", ctx.Err())
}

func StartServer(cfg *config.Config, db *sql.DB) (*Server, error) {
	server := NewServer(cfg, db)

	if err := server.Start(); err != nil {
		return nil, err
	}

	return server, nil
}
