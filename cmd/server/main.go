package main

import (
	"context"
	"database/sql"
	"fmt"
	"log/slog"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/zeusnotfound04/nano-mail/database"
	"github.com/zeusnotfound04/nano-mail/internal/config"
	"github.com/zeusnotfound04/nano-mail/internal/server"
)

const shutdownTimeout = 20 * time.Second

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: config.LogLevel(),
	}))
	slog.SetDefault(logger)

	cfg := config.Load()
	cfg.Logger = logger

	db, err := database.ConnectDB()
	if err != nil {
		logger.Error("Failed to connect to database", "error", err)
		os.Exit(1)
	}
	defer db.Close()

	if err := initSchema(db); err != nil {
		logger.Error("Failed to initialize schema", "error", err)
		os.Exit(1)
	}

	srv, err := server.StartServer(cfg, db)
	if err != nil {
		logger.Error("Failed to start server", "error", err)
		os.Exit(1)
	}

	done := make(chan os.Signal, 1)
	signal.Notify(done, syscall.SIGINT, syscall.SIGTERM)

	sig := <-done
	logger.Info("Shutdown signal received", "signal", sig.String())

	ctx, cancel := context.WithTimeout(context.Background(), shutdownTimeout)
	defer cancel()

	if err := srv.Stop(ctx); err != nil {
		logger.Error("Error during server shutdown", "error", err)
		os.Exit(1)
	}

	logger.Info("Server shutdown complete")
}

func initSchema(db *sql.DB) error {
	query := `
    CREATE TABLE IF NOT EXISTS emails (
        id SERIAL PRIMARY KEY,
        sender TEXT,
        recipients TEXT[],
        subject TEXT,
        body TEXT,
        size BIGINT,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS emails_recipients_idx ON emails USING GIN (recipients);
    CREATE INDEX IF NOT EXISTS emails_created_at_idx ON emails (created_at);
    `

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if _, err := db.ExecContext(ctx, query); err != nil {
		return fmt.Errorf("failed to initialize schema: %w", err)
	}

	slog.Info("Schema initialized")
	return nil
}
