package server

import (
	"bufio"
	"context"
	"database/sql"
	"fmt"
	"net"

	"github.com/zeusnotfound04/nano-mail/internal/config"
	"github.com/zeusnotfound04/nano-mail/internal/limiter"
)

// type Server struct {
// 	config      *config.Config
// 	listener    net.Listener
// 	shutdown    chan struct{}
// 	wg          sync.WaitGroup
// 	rateLimiter limiter.ConnectionLimiter
// }

func NewServer(cfg *config.Config , db *sql.DB) *Server {
	if cfg == nil {
		cfg = config.DefaultConfig()
	}
	
	fmt.Println("new sever func ka db hai ji ::::::\n" , db  )

	var connectionLimiter limiter.ConnectionLimiter

	maxPerIP := 10
	if cfg.ConnectionPerIP > 0 {
		maxPerIP = cfg.ConnectionPerIP
	}

	connectionLimiter = limiter.NewRateLimiter(maxPerIP)

	return &Server{
		config:      cfg,
		shutdown:    make(chan struct{}),
		rateLimiter: connectionLimiter,
		db:  db,
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
	fmt.Println("accept connection func ka db hai ji ::::::\n" , s.db  )
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
	fmt.Println("handle connection func ka db hai ji ::::::\n" , s.db  )
	
	session := &smtpSession{
		server:     s,
		conn:       conn,
		reader:     bufio.NewReader(conn),
		writer:     bufio.NewWriter(conn),
		state:      stateInit,
		recipients: make([]string, 0, s.config.MaxRecipients),
		remoteAddr: conn.RemoteAddr().String(),
		ctx:        context.Background(),
	}

	greeting := fmt.Sprintf("200 %s ESMTP ready\r\n", s.config.Domain)
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

	if s.config.StorageBackend != nil {
		return s.config.StorageBackend.Close()
	}

	return nil
}

func StartServer(config *config.Config ,  db *sql.DB) (*Server, error) {
	
	fmt.Println("start server func ka db hai ji ::::::\n" , db  )
	server := NewServer(config , db)
	err := server.Start()
	if err != nil {
		return nil, err
	}

	return server, nil
}
