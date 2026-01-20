#!/bin/bash
# Bloom - Database Reset Script
# Resetea completamente la base de datos y ejecuta migraciones + seed

set -e

echo "🗑️  Bloom Database Reset"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local file not found"
    echo "💡 Copy .env.example to .env.local and configure it"
    exit 1
fi

# Load environment variables
export $(cat .env.local | grep -v '#' | xargs)

# Confirmation prompt
read -p "⚠️  This will DELETE all data. Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled"
    exit 1
fi

echo ""
echo "1️⃣  Resetting database..."
npx prisma migrate reset --force --skip-seed

echo ""
echo "2️⃣  Running migrations..."
npx prisma migrate deploy

echo ""
echo "3️⃣  Generating Prisma Client..."
npx prisma generate

echo ""
echo "4️⃣  Running seed..."
npx prisma db seed

echo ""
echo "✅ Database reset complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Database is ready for development"
echo "🔑 Check seed output for default credentials"
