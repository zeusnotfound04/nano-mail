# Email Cleanup Script

This script provides a safe way to delete all emails from the NanoMail database.

## Usage

### Interactive Mode (Recommended)
```bash
cd ui/scripts
npm run cleanup
```

### Force Mode (No Confirmation)
```bash
cd ui/scripts  
npm run cleanup:force
```

### Direct Node Execution
```bash
cd ui/scripts
node cleanup-emails.js
```

## Features

- ✅ Interactive confirmation to prevent accidental deletion
- ✅ Shows email count before deletion
- ✅ Provides detailed cleanup statistics
- ✅ Resets database ID sequence after cleanup
- ✅ Graceful error handling and interruption support
- ✅ Uses Prisma ORM for safe database operations

## Safety Features

- Requires typing "DELETE ALL EMAILS" for confirmation
- Shows warning messages before deletion
- Handles database connection errors gracefully
- Supports Ctrl+C interruption

## Prerequisites

- Node.js installed
- Prisma client configured
- Database connection available

## Warning

⚠️ **This script will permanently delete ALL emails from the database. This action cannot be undone.**

Use with caution, especially in production environments.
