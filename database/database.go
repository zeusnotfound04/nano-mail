package database

import (
	"context"
	"database/sql"
	"fmt"
	"log"
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
	db, err := sql.Open("postgres", dcs)
	fmt.Println("DB URL" , dcs)
	if err != nil {
		log.Println(DATABASE_ERROR)
		return nil, err
	}
	log.Println(DATABASE_CONNECTED)
	return db, nil

}





func StoreMail(ctx context.Context, db *sql.DB, msg *message.Message) error {
	fmt.Println("📨 Incoming message to store in DB:")
	fmt.Printf("From: %s\nTo: %v\nSubject: %s\nSize: %d\nDate: %v\n",
		msg.From, msg.To, msg.Subject, msg.Size, msg.Date)
		fmt.Println("ander jaaa chuka hai store mail func ka db hai ji ::::::\n" , db  )
	// Check DB connection
	fmt.Println("🔌 Checking DB connection...")
	if err := db.PingContext(ctx); err != nil {
		return fmt.Errorf("❌ database connection unavailable: %w", err)
	}

	// if err := db.Ping() ; err != nil {
	// 	return fmt.Errorf("❌ fucked up")
	// }
	fmt.Println("✅ DB connection is alive")

	// Print and convert headers
	fmt.Printf("📬 Headers Type: %T\n", msg.Headers)

	headerMap := make(map[string]string)
	for k, v := range msg.Headers {
		fmt.Printf("🔹 Header: %s => %v\n", k, v)
		headerMap[k] = strings.Join(v, ", ")
	}
	fmt.Println("✅ Converted header map:\n", headerMap)

	// Optional: convert headers to JSON string (if you prefer)
	/*
	headersJSON, err := json.Marshal(headerMap)
	if err != nil {
		return fmt.Errorf("failed to encode headers: %w", err)
	}
	*/

	query := `
		INSERT INTO emails (
			sender, recipients, subject, body, headers, size, created_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7
		)
		RETURNING id;
	`

	var id int
	err := db.QueryRowContext(
		ctx,
		query,
		msg.From,
		pq.Array(msg.To),
		msg.Subject,
		msg.Body,
		headerMap, // use headersJSON here if you go that route
		msg.Size,
		msg.Date,
	).Scan(&id)

	if err != nil {
		log.Printf("❌ Failed to store email in database: %v", err)
		return fmt.Errorf("failed to store the email: %w", err)
	}

	log.Printf("✅ Email stored in the DATABASE with ID: %d", id)
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
