package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/zeusnotfound04/nano-mail/database"
)

func main() {
	fmt.Println("=== NanoMail Cleanup Script ===")
	fmt.Println("This will delete ALL emails from the database.")
	fmt.Print("Are you sure you want to continue? (yes/no): ")

	var confirmation string
	fmt.Scanln(&confirmation)

	if confirmation != "yes" {
		fmt.Println("Cleanup cancelled.")
		os.Exit(0)
	}

	fmt.Println("Connecting to database...")
	db, err := database.ConnectDB()
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	fmt.Println("Starting email cleanup...")

	result, err := db.ExecContext(ctx, "DELETE FROM emails")
	if err != nil {
		log.Fatal("Failed to delete emails:", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		log.Printf("Warning: Could not get rows affected count: %v", err)
		rowsAffected = 0
	}

	fmt.Printf("✅ Successfully deleted %d emails from the database\n", rowsAffected)

	fmt.Println("Resetting auto-increment counter...")
	_, err = db.ExecContext(ctx, "ALTER SEQUENCE emails_id_seq RESTART WITH 1")
	if err != nil {
		log.Printf("Warning: Could not reset sequence: %v", err)
	} else {
		fmt.Println("✅ Successfully reset ID sequence")
	}

	fmt.Println("🧹 Email cleanup completed successfully!")
}
