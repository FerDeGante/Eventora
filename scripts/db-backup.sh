#!/bin/bash
# Bloom - Database Backup Script
# Crea un backup de la base de datos PostgreSQL

set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="bloom_backup_${TIMESTAMP}.sql"

echo "💾 Bloom Database Backup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local file not found"
    exit 1
fi

# Extract database URL from .env.local
DATABASE_URL=$(grep DATABASE_URL .env.local | cut -d '=' -f2- | tr -d '"' | tr -d "'")

if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL not found in .env.local"
    exit 1
fi

# Extract connection details from DATABASE_URL
# Format: postgresql://user:password@host:port/database
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

echo "📍 Database: $DB_NAME@$DB_HOST:$DB_PORT"
echo "💾 Backup file: $BACKUP_DIR/$BACKUP_FILE"
echo ""

# Create backup
PGPASSWORD="$DB_PASS" pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    -F p \
    -f "$BACKUP_DIR/$BACKUP_FILE"

# Compress backup
echo "🗜️  Compressing backup..."
gzip "$BACKUP_DIR/$BACKUP_FILE"

COMPRESSED_FILE="${BACKUP_FILE}.gz"
FILE_SIZE=$(du -h "$BACKUP_DIR/$COMPRESSED_FILE" | cut -f1)

echo ""
echo "✅ Backup created successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📁 File: $BACKUP_DIR/$COMPRESSED_FILE"
echo "📊 Size: $FILE_SIZE"
echo ""
echo "💡 To restore this backup, run:"
echo "   ./scripts/db-restore.sh $COMPRESSED_FILE"
