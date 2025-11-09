#!/bin/bash

# Setup script for Telegram Flick Bot

echo "🎬 Setting up Telegram Flick Bot..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+ first."
    exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from env.example..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your credentials before continuing."
    exit 0
fi

# Check if PostgreSQL database exists
echo "🗄️  Checking database..."
if command -v psql &> /dev/null; then
    DB_NAME=$(grep DATABASE_URL .env | cut -d'/' -f4 | cut -d'?' -f1)
    if psql -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
        echo "✅ Database $DB_NAME exists"
    else
        echo "📊 Creating database $DB_NAME..."
        createdb $DB_NAME
    fi
else
    echo "⚠️  PostgreSQL CLI not found. Please ensure database exists manually."
fi

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
pnpm db:generate

# Push schema to database
echo "📊 Pushing schema to database..."
pnpm db:push

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Make sure all credentials in .env are correct"
echo "2. Ensure PostgreSQL and MinIO are running"
echo "3. Run 'pnpm dev' to start the bot in development mode"
echo "   or 'pnpm build && pnpm start' for production"

