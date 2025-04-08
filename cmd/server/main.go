package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"log/slog"
	"os"
	"os/signal"
	"syscall"
	"time"

	// "github.com/zeusnotfound04/nano-mail/database"
	// "github.com/zeusnotfound04/nano-mail/helper"
	"github.com/zeusnotfound04/nano-mail/database"
	"github.com/zeusnotfound04/nano-mail/internal/config"
	"github.com/zeusnotfound04/nano-mail/internal/server"
)

func main() {

	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))


	cfg := config.DefaultConfig()
	cfg.Host = "0.0.0.0"
	cfg.Port = "25"
	cfg.Domain = "zeus.nanomail.live"
	cfg.MaxMessageSize = 20 * 1024 * 1024
	cfg.ConnectionPerIP = 5



	db, err := database.ConnectDB()
	fmt.Println("main func ka db hai ji ::::::\n" , db  )
	if err != nil {
		log.Fatal("Failed to connect to DB:", err)
	}
	initSchema(db)
	// defer db.Close()

	logger.Info("Starting SMTP server....")
	srv , err := server.StartServer(cfg , db)
	if err != nil {
		logger.Error("Failed to start server" , "error" , err)
		os.Exit(1)
	}

	done := make(chan os.Signal , 1)
	signal.Notify(done, os.Interrupt , syscall.SIGINT , syscall.SIGALRM)

	logger.Info("Server is running" ,
		"host" , cfg.Host,
		"port" , cfg.Port,
		"domain" , cfg.Domain)

	<-done
	logger.Info("Shutting down server.....")

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	go func() {
		<-ctx.Done()
		if ctx.Err() == context.DeadlineExceeded {
			logger.Error("Server shutdown timed out")
			os.Exit(1)
		}
	}()



	if err := srv.Stop(); err != nil {
		logger.Error("Error during server shutdown" , "error" , err)
		os.Exit(1)
	}

	logger.Info("Server shutdown complete")



}

//  For intial scehama intialization for the first time
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
    `
    _, err := db.Exec(query)

    if err != nil {
        return fmt.Errorf("failed to initialize schema: %w", err)
    }

	fmt.Println("Schema initialized successfully!!")
    return nil
}