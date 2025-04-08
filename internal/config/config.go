package config

import (
	"log/slog"
	"time"

	"github.com/zeusnotfound04/nano-mail/internal/limiter"
)

type Config struct {
	Host              string
	Port              string
	Domain            string
	MaxMessageSize    int64
	MaxRecipients     int
	ReadTimeout       time.Duration
	WriteTimeout      time.Duration
	AllowInsecureAuth bool
	EnableCompression bool
	TLSCertFile       string
	TLSKeyFile        string
	Logger            *slog.Logger
	ConnectionPerIP   int
	ConnectionLimiter map[string]limiter.ConnectionLimiter
}

func DefaultConfig() *Config {
	return &Config{
		Host:              "localhost",
		Port:              "25",
		Domain:            "localhost",
		MaxMessageSize:    10 * 1024 * 1024,
		MaxRecipients:     50,
		ReadTimeout:       3 * time.Minute,
		WriteTimeout:      3 * time.Minute,
		AllowInsecureAuth: false,
		EnableCompression: true,
		Logger:            slog.Default(),
		ConnectionPerIP:   10,
	}
}
