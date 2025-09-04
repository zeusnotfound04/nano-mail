package server

import (
	"bufio"
	"context"
	"database/sql"
	"fmt"
	"net"
	"time"

	"github.com/zeusnotfound04/nano-mail/database"
	"github.com/zeusnotfound04/nano-mail/internal/config"
	"github.com/zeusnotfound04/nano-mail/internal/limiter"
	"github.com/zeusnotfound04/nano-mail/pkg/message"
)

func NewServer(cfg *config.Config, db *sql.DB) *Server {
	if cfg == nil {
		cfg = config.DefaultConfig()
	}

	var connectionLimiter limiter.ConnectionLimiter

	maxPerIP := 10
	if cfg.ConnectionPerIP > 0 {
		maxPerIP = cfg.ConnectionPerIP
	}

	connectionLimiter = limiter.NewRateLimiter(maxPerIP)

	server := &Server{
		config:      cfg,
		shutdown:    make(chan struct{}),
		rateLimiter: connectionLimiter,
		db:          db,
		mailQueue:   make(chan *message.Message, 1000),
		workers:     4,
	}

	for i := 0; i < server.workers; i++ {
		server.wg.Add(1)
		go server.processMailQueue()
	}

	return server
}

func (s *Server) processMailQueue() {
	defer s.wg.Done()
	for {
		select {
		case <-s.shutdown:
			return
		case msg := <-s.mailQueue:
			ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
			err := database.StoreMail(ctx, s.db, msg)
			cancel()

			if err != nil {
				s.config.Logger.Error("Failed to store mail from queue", "error", err)
			} else {
				s.config.Logger.Debug("Mail stored from queue", "from", msg.From, "size", msg.Size)
			}
		}
	}
}

func (s *Server) Start() error {
	addr := fmt.Sprintf("%s:%s", s.config.Host, s.config.Port)

	var err error
	s.listener, err = net.Listen("tcp", addr)
	if err != nil {
		return fmt.Errorf("failed to start SMTP server: %w", err)
	}

	s.config.Logger.Info("SMTP server started",
		"host", s.config.Host,
		"port", s.config.Port,
		"domain", s.config.Domain)

	s.wg.Add(1)
	go s.acceptConnections()

	return nil
}

func (s *Server) acceptConnections() {
	defer s.wg.Done()
	for {
		select {
		case <-s.shutdown:
			return
		default:
			conn, err := s.listener.Accept()
			if err != nil {
				s.config.Logger.Error("Error accepting connection", "error", err)
				return
			}

			remoteIP, _, _ := net.SplitHostPort(conn.RemoteAddr().String())
			if !s.rateLimiter.Allow(remoteIP) {
				s.config.Logger.Warn("Connection rate limit exceeded", "ip", remoteIP)
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
}

func (s *Server) handleConnection(conn net.Conn) {
	defer conn.Close()

	messageBuffer := getPooledBuffer()
	defer returnPooledBuffer(messageBuffer)

	session := &smtpSession{
		server:     s,
		conn:       conn,
		reader:     bufio.NewReader(conn),
		writer:     bufio.NewWriter(conn),
		state:      stateInit,
		recipients: make([]string, 0, s.config.MaxRecipients),
		message:    messageBuffer,
		remoteAddr: conn.RemoteAddr().String(),
		ctx:        context.Background(),
	}

	greeting := fmt.Sprintf("220 %s ESMTP ready\r\n", s.config.Domain)
	if err := session.writeResponse(greeting); err != nil {
		s.config.Logger.Error("Failed to send greeting", "error", err, "client", session.remoteAddr)
		return
	}

	session.process()
}

func (s *Server) Stop() error {
	close(s.shutdown)

	if s.listener != nil {
		s.listener.Close()
	}

	s.wg.Wait()
	return nil
}

func StartServer(config *config.Config, db *sql.DB) (*Server, error) {

	server := NewServer(config, db)
	err := server.Start()
	if err != nil {
		return nil, err
	}

	return server, nil
}
