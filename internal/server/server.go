package server

import (
	"fmt"
	"net"
	"sync"

	"github.com/zeusnotfound04/nano-mail/internal/config"
	"github.com/zeusnotfound04/nano-mail/internal/limiter"
	"golang.org/x/tools/go/analysis/passes/defers"
)

type Server struct {
	config      *config.Config
	listener    net.Listener
	shutdown    chan struct{}
	wg          sync.WaitGroup
	rateLimiter limiter.ConnectionLimiter
}

func NewServer(cfg *config.Config) *Server {
	if cfg == nil {
		cfg = config.DefaultConfig()
	}

	var connectionLimiter limiter.ConnectionLimiter
	
	// Use default max connections per IP if not specified
	maxPerIP := 10 // You can adjust this default value
	if cfg.ConnectionPerIP > 0 {
		maxPerIP = cfg.ConnectionPerIP
	}
	
	// Create a new rate limiter with the specified or default max connections
	connectionLimiter = limiter.NewRateLimiter(maxPerIP)

	return &Server{
		config:      cfg,
		shutdown:    make(chan struct{}),
		rateLimiter: connectionLimiter,
	}
}


func (s *Server) Start() error {
	addr := fmt.Sprintf("%s:%s", s.config.Host, s.config.Port)

	var err error
	s.listener , err = net.Listen("tcp" , addr)
	if err != nil {
		return fmt.Errorf("Failed to start SMTP server: %w" , err)
	}

	s.config.Logger.Info("SMTP server started" ,
		"host" , s.config.Host,
		"port" , s.config.Port,
		"domain" , s.config.Domain)
	
	s.wg.Add(1)
	go s.
}


func (s *Server) acceptConnection() {
	defer s.wg.Done()

	for {
		select {
		case <-s.shutdown:
			return
		default:
			conn, err := s.listener.Accept()
			if err != nil {
				s.config.Logger.Error("Error  accepting connection" , "error" , err)
				return
			}

			remoteIP, _, _ := net.SplitHostPort(conn.RemoteAddr().Network().String())
			if !s.rateLimiter.Allow(remoteIP) {
				s.config.Logger.Warn("Connection rate Limit exceeded", "ip" , remoteIP)
				conn.Write([]byte("421 Too Many Connections from your IP\r\n"))
				conn.Close()
				continue
			}

			s.wg.Add(1)
			go func(c net.Conn , ip string) {
				defer s.wg.Done()
				defer s.rateLimiter.Release(ip)
				s.handleConnection(c)
			}(conn , remoteIP)
		}
	}
}