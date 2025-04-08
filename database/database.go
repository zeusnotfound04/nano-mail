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

	// Check DB connection first
	var err error
	for retries := 0; retries < 3; retries++ {
		fmt.Printf("DB connection check attempt %d/3\n", retries+1)
		err = db.PingContext(ctx)
		if err == nil {
			fmt.Println("DB connection check successful")
			break
		}
		log.Printf("DB connection check failed (attempt %d/3): %v", retries+1, err)
		time.Sleep(time.Duration(retries+1) * 500 * time.Millisecond)
	}

	if err != nil {
		fmt.Println("All DB connection check attempts failed, trying to reconnect")
		log.Println("Attempting to reestablish database connection...")
		newDB, reconnectErr := ConnectDB()
		if reconnectErr != nil {
			fmt.Printf("Failed to reconnect to database: %v\n", reconnectErr)
			log.Printf("Failed to reconnect to database: %v", reconnectErr)
			return fmt.Errorf("database connection unavailable: %w", err)
		}

		db = newDB
		fmt.Println("Reconnected to database, checking connection...")

		if pingErr := db.PingContext(ctx); pingErr != nil {
			fmt.Printf("Reconnected database still not responding: %v\n", pingErr)
			return fmt.Errorf("reconnected database still unavailable: %w", pingErr)
		}
		fmt.Println("Reconnection successful")
	}

	fmt.Println("DB connection is alive, proceeding with storing message")

	// Begin transaction
	fmt.Println("Beginning database transaction...")
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		fmt.Printf("Failed to begin transaction: %v\n", err)
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// Prepare insert query
	query := `
		INSERT INTO emails (
			sender, recipients, subject, body, size, created_at
		) VALUES (
			$1, $2, $3, $4, $5, $6
		)
		RETURNING id;
	`
	fmt.Println("Executing insert query...")
	fmt.Printf("Parameters: sender=%s, recipients=%v, subject=%s, bodySize=%d, size=%d, date=%v\n",
		msg.From, msg.To, msg.Subject, len(msg.Body), msg.Size, msg.Date)

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
		fmt.Printf("Database insert failed: %v\n", err)
		log.Printf("Failed to store email in database: %v", err)
		return fmt.Errorf("failed to store the email: %w", err)
	}

	fmt.Println("Insert successful, committing transaction...")
	if err = tx.Commit(); err != nil {
		fmt.Printf("Failed to commit transaction: %v\n", err)
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	fmt.Printf("Email stored in the DATABASE with ID: %d\n", id)
	log.Printf("Email stored in the DATABASE with ID: %d", id)
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
