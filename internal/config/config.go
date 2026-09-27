package config

import (
	"log/slog"
	"os"
	"strconv"
	"strings"
	"time"
)

type Config struct {
	Host              string
	Port              string
	Domain            string
	AllowedDomains    []string
	MaxMessageSize    int64
	MaxRecipients     int
	ReadTimeout       time.Duration
	WriteTimeout      time.Duration
	StoreTimeout      time.Duration
	RetentionPeriod   time.Duration
	RetentionInterval time.Duration
	RetentionTimeout  time.Duration
	EnableChunking    bool
	TLSCertFile       string
	TLSKeyFile        string
	Logger            *slog.Logger
	ConnectionPerIP   int
	MaxConnections    int
}

func DefaultConfig() *Config {
	return &Config{
		Host:              "0.0.0.0",
		Port:              "25",
		Domain:            "zeus.nanomail.in",
		MaxMessageSize:    20 * 1024 * 1024,
		MaxRecipients:     50,
		ReadTimeout:       30 * time.Second,
		WriteTimeout:      30 * time.Second,
		StoreTimeout:      10 * time.Second,
		RetentionPeriod:   24 * time.Hour,
		RetentionInterval: 15 * time.Minute,
		RetentionTimeout:  5 * time.Minute,
		EnableChunking:    true,
		Logger:            slog.Default(),
		ConnectionPerIP:   10,
		MaxConnections:    1000,
	}
}

func Load() *Config {
	cfg := DefaultConfig()

	cfg.Host = envString("SMTP_HOST", cfg.Host)
	cfg.Port = envString("SMTP_PORT", cfg.Port)
	cfg.Domain = envString("SMTP_DOMAIN", cfg.Domain)
	cfg.AllowedDomains = envList("SMTP_ALLOWED_DOMAINS", cfg.AllowedDomains)
	cfg.MaxMessageSize = envInt64("SMTP_MAX_MESSAGE_SIZE", cfg.MaxMessageSize)
	cfg.MaxRecipients = envInt("SMTP_MAX_RECIPIENTS", cfg.MaxRecipients)
	cfg.ConnectionPerIP = envInt("SMTP_CONNECTIONS_PER_IP", cfg.ConnectionPerIP)
	cfg.MaxConnections = envInt("SMTP_MAX_CONNECTIONS", cfg.MaxConnections)
	cfg.ReadTimeout = envDuration("SMTP_READ_TIMEOUT", cfg.ReadTimeout)
	cfg.WriteTimeout = envDuration("SMTP_WRITE_TIMEOUT", cfg.WriteTimeout)
	cfg.StoreTimeout = envDuration("SMTP_STORE_TIMEOUT", cfg.StoreTimeout)
	cfg.RetentionPeriod = envDuration("RETENTION_PERIOD", cfg.RetentionPeriod)
	cfg.RetentionInterval = envDuration("RETENTION_INTERVAL", cfg.RetentionInterval)
	cfg.RetentionTimeout = envDuration("RETENTION_TIMEOUT", cfg.RetentionTimeout)

	cfg.Normalize()
	return cfg
}

func (c *Config) Normalize() {
	c.Domain = strings.ToLower(strings.TrimSpace(c.Domain))

	seen := make(map[string]struct{}, len(c.AllowedDomains)+1)
	domains := make([]string, 0, len(c.AllowedDomains)+1)

	for _, d := range append([]string{c.Domain}, c.AllowedDomains...) {
		d = strings.ToLower(strings.TrimSpace(d))
		if d == "" {
			continue
		}
		if _, dup := seen[d]; dup {
			continue
		}
		seen[d] = struct{}{}
		domains = append(domains, d)
	}

	c.AllowedDomains = domains
}

func (c *Config) IsAllowedRecipient(addr string) bool {
	at := strings.LastIndexByte(addr, '@')
	if at < 0 || at == len(addr)-1 {
		return false
	}

	domain := strings.ToLower(addr[at+1:])
	for _, d := range c.AllowedDomains {
		if domain == d {
			return true
		}
	}

	return false
}

func LogLevel() slog.Level {
	switch strings.ToLower(strings.TrimSpace(os.Getenv("LOG_LEVEL"))) {
	case "debug":
		return slog.LevelDebug
	case "warn":
		return slog.LevelWarn
	case "error":
		return slog.LevelError
	default:
		return slog.LevelInfo
	}
}

func envString(key, fallback string) string {
	if v := strings.TrimSpace(os.Getenv(key)); v != "" {
		return v
	}
	return fallback
}

func envList(key string, fallback []string) []string {
	v := strings.TrimSpace(os.Getenv(key))
	if v == "" {
		return fallback
	}

	parts := strings.Split(v, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		if p = strings.TrimSpace(p); p != "" {
			out = append(out, p)
		}
	}

	return out
}

func envInt(key string, fallback int) int {
	v := strings.TrimSpace(os.Getenv(key))
	if v == "" {
		return fallback
	}

	n, err := strconv.Atoi(v)
	if err != nil || n <= 0 {
		return fallback
	}

	return n
}

func envInt64(key string, fallback int64) int64 {
	v := strings.TrimSpace(os.Getenv(key))
	if v == "" {
		return fallback
	}

	n, err := strconv.ParseInt(v, 10, 64)
	if err != nil || n <= 0 {
		return fallback
	}

	return n
}

func envDuration(key string, fallback time.Duration) time.Duration {
	v := strings.TrimSpace(os.Getenv(key))
	if v == "" {
		return fallback
	}

	d, err := time.ParseDuration(v)
	if err != nil || d < 0 {
		return fallback
	}

	return d
}
