#!/bin/bash

# Docker setup script for Telegram Flick Bot

echo "🐳 Setting up Telegram Flick Bot with Docker..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install docker-compose first."
    exit 1
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from env.example..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your Telegram, OpenAI, and Replicate credentials."
    echo "    DATABASE_URL and MinIO settings will be handled by Docker."
    exit 0
fi

# Check if required environment variables are set
if ! grep -q "TELEGRAM_BOT_TOKEN=.*[^_here]" .env || \
   ! grep -q "OPENAI_API_KEY=.*[^_here]" .env || \
   ! grep -q "REPLICATE_API_TOKEN=.*[^_here]" .env; then
    echo "⚠️  Please set TELEGRAM_BOT_TOKEN, OPENAI_API_KEY, and REPLICATE_API_TOKEN in .env"
    exit 1
fi

echo "🚀 Starting services with Docker Compose..."
docker-compose up -d postgres minio

echo "⏳ Waiting for services to be ready..."
sleep 10

echo "📊 Running Prisma migrations..."
docker-compose run --rm bot npx prisma db push

echo "🤖 Starting bot..."
docker-compose up -d bot

echo ""
echo "✅ Setup complete!"
echo ""
echo "Services:"
echo "  - Bot: Running in background"
echo "  - PostgreSQL: localhost:5432"
echo "  - MinIO Console: http://localhost:9001 (minioadmin/minioadmin)"
echo ""
echo "Useful commands:"
echo "  - View logs: docker-compose logs -f bot"
echo "  - Stop all: docker-compose down"
echo "  - Restart bot: docker-compose restart bot"

