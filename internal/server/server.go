package server

import (
	"net"
	"sync"

	"github.com/zeusnotfound04/nano-mail/internal/config"
	"github.com/zeusnotfound04/nano-mail/internal/limiter"
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


