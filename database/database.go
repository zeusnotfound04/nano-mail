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

	dcs := os.Getenv("DATABASE_URL")
	db, err := sql.Open("postgres", dcs)
	if err != nil {
		log.Println(DATABASE_ERROR)
		return nil, err
	}
	log.Println(DATABASE_CONNECTED)
	return db, nil

}

func InitSchema(db *sql.DB) error {
	query := `
		CREATE TABLE IF NOT EXISTS emails (
		  id   SERIAL  PRIMARY KEY,
		  sender  TEXT NOT NULL,
		  recipients TEXT[] NOT NULL,
		  subjects TEXT,
		  body TEXT NOT NULL,
		  size BIGINT NOT NULL,
		  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()

		);

		CREATE INDEX IF NOT EXISTS idx_emails_created_at ON emails(created_at);
		CREATE INDEX IF NOT EXISTS idx_emails_sender ON emails(sender)
	`
	_, err := db.Exec(query)

	if err != nil {
		return fmt.Errorf("Failed to create the schema : %w", err)
	}

	return nil
}

func StoreMail(ctx context.Context, db *sql.DB, msg *message.Message) error {
	headerMap := make(map[string]string)

	for k, v := range msg.Headers {
		headerMap[k] = strings.Join(v, ", ")
	}

	query := `
	 INSERT INTO emails (sender, recipients , subject , body , headers , size , created_at)
	 VALUES ($1, $2 , $3 , $4 , $5 ,  $6 , $7)
	 RETURNING id
	`

	var id int

	err := db.QueryRowContext(
		ctx,
		query,
		msg.From,
		pq.Array(msg.To),
		msg.Subject,
		msg.Body,
		headerMap,
		msg.Size,
		msg.Date,
	).Scan(&id)

	if err != nil {
		log.Printf("Failed to store emails in database : %v", err)
		return fmt.Errorf("Failed to share the email : %w", err)
	}

	log.Printf("Email stored in the DATABASE with ID : %d", id)
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
		return 0, fmt.Errorf("Failed to delete old emails : %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return 0, fmt.Errorf("Failed to get affected rows : %w", err)
	}

	log.Printf("Deleted %d emails older than %s", rowsAffected, olderThan.String())
	return rowsAffected, nil
}
