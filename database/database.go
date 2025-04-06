package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
)


const (
	DATABASE_ERROR="Error connecting to database"
	DATABASE_CONNECTED = "Connected to database successfully"
)

func ConnectDB() (*sql.DB, error) {
	err := godotenv.Load(".env")
	if err!= nil {
		log.Println("Error loading .env file")
	}

	dcs := os.Getenv("DATABASE_URL")
	db, err := sql.Open("postgres" , dcs)
	if err!= nil {
		log.Println(DATABASE_ERROR)
		return nil , err
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
		return fmt.Errorf("Failed to create the schema : %w" , err)
	}

	return nil
}

