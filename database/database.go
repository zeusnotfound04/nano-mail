package database

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net"
	"os"
	"strings"
	"time"

	"github.com/joho/godotenv"
	"github.com/lib/pq"
	"github.com/zeusnotfound04/nano-mail/pkg/message"
)

const (
	DATABASE_ERROR     = "Error connecting to database"
	DATABASE_CONNECTED = "Connected to database successfully"
)

func ConnectDB() (*sql.DB, error) {
	err := godotenv.Load(".env")
	if err != nil {
		log.Println("Error loading .env file")
	}

	fmt.Println("DB URL")

	dcs := os.Getenv("DATABASE_URL")
	if dcs == "" {
		return nil, fmt.Errorf("DATABASE_URL environment variable is empty")
	}

	hostStart := strings.Index(dcs, "@")
	hostEnd := strings.LastIndex(dcs, ":")
	if hostStart > 0 && hostEnd > hostStart {
		hostname := dcs[hostStart+1 : hostEnd]

		_, err := net.LookupHost(hostname)
		if err != nil {
			log.Printf("Warning: Could not resolve database hostname %s: %v", hostname, err)
		}
	}

	db, err := sql.Open("postgres", dcs)
	fmt.Println("DB URL", dcs)
	if err != nil {
		log.Println(DATABASE_ERROR)
		return nil, err
	}

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := db.PingContext(ctx); err != nil {
		log.Printf("Failed to verify database connection: %v", err)
		return nil, fmt.Errorf("database connection validation failed: %w", err)
	}

	log.Println(DATABASE_CONNECTED)
	return db, nil
}

func StoreMail(ctx context.Context, db *sql.DB, msg *message.Message) error {
	fmt.Println("📨 Incoming message to store in DB:")
	fmt.Printf("From: %s\nTo: %v\nSubject: %s\nSize: %d\nDate: %v\n",
		msg.From, msg.To, msg.Subject, msg.Size, msg.Date)

	fmt.Println("🔌 Checking DB connection...")
	var err error
	for retries := 0; retries < 3; retries++ {
		err = db.PingContext(ctx)
		if err == nil {
			break 
		}
		log.Printf("DB connection check failed (attempt %d/3): %v", retries+1, err)
		time.Sleep(time.Duration(retries+1) * 500 * time.Millisecond) 
	}

	if err != nil {
		
		log.Println("Attempting to reestablish database connection...")
		newDB, reconnectErr := ConnectDB()
		if reconnectErr != nil {
			log.Printf("Failed to reconnect to database: %v", reconnectErr)
			return fmt.Errorf(" database connection unavailable: %w", err)
		}

		db = newDB

		if pingErr := db.PingContext(ctx); pingErr != nil {
			return fmt.Errorf(" reconnected database still unavailable: %w", pingErr)
		}
	}

	fmt.Println("DB connection is alive")

	fmt.Printf("📬 Headers Type: %T\n", msg.Headers)
	for k, v := range msg.Headers {
		fmt.Printf("🔹 Header: %s => %v\n", k, v)
	}

	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	
	query := `
		INSERT INTO emails (
			sender, recipients, subject, body, size, created_at
		) VALUES (
			$1, $2, $3, $4, $5, $6
		)
		RETURNING id;
	`

	var id int
	err = tx.QueryRowContext(
		ctx,
		query,
		msg.From,
		pq.Array(msg.To),
		msg.Subject,
		msg.Body,
		msg.Size,
		msg.Date,
	).Scan(&id)

	if err != nil {
		log.Printf(" Failed to store email in database: %v", err)
		return fmt.Errorf("failed to store the email: %w", err)
	}

	if err = tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	log.Printf(" Email stored in the DATABASE with ID: %d", id)
	return nil
}

func DeleteOldMails(ctx context.Context, db *sql.DB, olderThan time.Duration) (int64, error) {
	cutOffTime := time.Now().Add(-olderThan)

	query := `
	DELETE FROM emails 
	WHERE created_at < $1
	`

	result, err := db.ExecContext(ctx, query, cutOffTime)
	if err != nil {
		return 0, fmt.Errorf("failed to delete old emails : %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return 0, fmt.Errorf("failed to get affected rows : %w", err)
	}

	log.Printf("Deleted %d emails older than %s", rowsAffected, olderThan.String())
	return rowsAffected, nil
}