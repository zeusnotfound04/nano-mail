package config

import (
	"log/slog"
	"time"

	"github.com/zeusnotfound04/nano-mail/internal/limiter"
	"github.com/zeusnotfound04/nano-mail/internal/storage"
)

type Config struct {
	Host               string
	Port               string
	Domain             string
	MaxMessageSize     int64
	MaxRecipients      int
	ReadTimeout        time.Duration
	WriteTimeout       time.Duration
	AllowInsecureAuth  bool
	StorageBackend     storage.StorageBackend
	EnableCompression  bool
	TLSCertFile        string
	TLSKeyFile         string
	Logger             *slog.Logger
	ConnectionPerIP    int
	ConnectionLimiter  map[string]limiter.ConnectionLimiter
}




func DefaultConfig()  *Config{
	return &Config{
		Host:                "localhost",
		Port:                "25",
		Domain:              "localhost",
		MaxMessageSize:      10 * 1024 * 1024,
		MaxRecipients:       50,
		ReadTimeout:         30* time.Second,
		WriteTimeout:        30 * time.Second,
		AllowInsecureAuth:   false,
		StorageBackend:      storage.NewMemoryStorage(),
		EnableCompression:   true,
		Logger:              slog.Default(),
		ConnectionPerIP:     10,

	}
}