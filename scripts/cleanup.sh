#!/bin/bash

# NanoMail Email Cleanup Script
# This script provides a convenient way to clean up all emails

echo "=== NanoMail Email Cleanup Script ==="
echo "This script will delete ALL emails from the database."
echo ""

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo "❌ Go is not installed or not in PATH"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "go.mod" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

echo "🚀 Running cleanup script..."
echo ""

# Run the Go cleanup script
go run scripts/cleanup.go

echo ""
echo "📝 Cleanup script execution completed."
