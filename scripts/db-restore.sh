#!/bin/bash
# Bloom - Database Restore Script
# Restaura una base de datos desde un backup

set -e

BACKUP_DIR="./backups"

echo "♻️  Bloom Database Restore"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if backup file argument is provided
if [ -z "$1" ]; then
    echo "❌ Error: No backup file specified"
    echo ""
    echo "Usage: ./scripts/db-restore.sh <backup_file>"
    echo ""
    echo "Available backups:"
    ls -lh "$BACKUP_DIR"/*.sql.gz 2>/dev/null || echo "  No backups found"
    exit 1
fi

BACKUP_FILE="$1"
FULL_PATH="$BACKUP_DIR/$BACKUP_FILE"

# Check if file exists
if [ ! -f "$FULL_PATH" ]; then
    echo "❌ Error: Backup file not found: $FULL_PATH"
    exit 1
fi

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

# Extract connection details
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

echo "📍 Database: $DB_NAME@$DB_HOST:$DB_PORT"
echo "📁 Backup file: $FULL_PATH"
echo ""

# Warning confirmation
read -p "⚠️  This will REPLACE all current data. Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled"
    exit 1
fi

echo ""
echo "1️⃣  Decompressing backup..."
TEMP_FILE="${FULL_PATH%.gz}"
gunzip -c "$FULL_PATH" > "$TEMP_FILE"

echo "2️⃣  Dropping existing database..."
PGPASSWORD="$DB_PASS" psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d postgres \
    -c "DROP DATABASE IF EXISTS $DB_NAME;"

echo "3️⃣  Creating fresh database..."
PGPASSWORD="$DB_PASS" psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d postgres \
    -c "CREATE DATABASE $DB_NAME;"

echo "4️⃣  Restoring data..."
PGPASSWORD="$DB_PASS" psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    -f "$TEMP_FILE"

echo "5️⃣  Cleaning up..."
rm "$TEMP_FILE"

echo ""
echo "✅ Database restored successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💡 Run migrations if schema has changed:"
echo "   npx prisma migrate deploy"
