package database

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/lib/pq"
	"github.com/zeusnotfound04/nano-mail/pkg/message"
)

const retentionBatchSize = 5000

func ConnectDB() (*sql.DB, error) {
	_ = godotenv.Load(".env")

	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		return nil, fmt.Errorf("DATABASE_URL environment variable is empty")
	}

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := db.PingContext(ctx); err != nil {
		db.Close()
		return nil, fmt.Errorf("database connection validation failed: %w", err)
	}

	return db, nil
}

func StoreMail(ctx context.Context, db *sql.DB, msg *message.Message) (int64, error) {
	query := `
		INSERT INTO emails (
			sender, recipients, subject, body, size, created_at
		) VALUES (
			$1, $2, $3, $4, $5, $6
		)
		RETURNING id;
	`

	var id int64
	err := db.QueryRowContext(
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
		return 0, fmt.Errorf("failed to store the email: %w", err)
	}

	return id, nil
}

func DeleteOldMails(ctx context.Context, db *sql.DB, olderThan time.Duration) (int64, error) {
	cutOffTime := time.Now().Add(-olderThan)

	query := `
		DELETE FROM emails
		WHERE id IN (
			SELECT id FROM emails WHERE created_at < $1 ORDER BY created_at LIMIT $2
		)
	`

	var total int64
	for {
		if err := ctx.Err(); err != nil {
			return total, err
		}

		result, err := db.ExecContext(ctx, query, cutOffTime, retentionBatchSize)
		if err != nil {
			return total, fmt.Errorf("failed to delete old emails: %w", err)
		}

		deleted, err := result.RowsAffected()
		if err != nil {
			return total, fmt.Errorf("failed to get affected rows: %w", err)
		}

		total += deleted
		if deleted < retentionBatchSize {
			return total, nil
		}
	}
}
