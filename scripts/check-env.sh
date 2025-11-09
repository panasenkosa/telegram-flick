#!/bin/bash

# Script to check if all required environment variables are set

echo "🔍 Checking environment variables..."

if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Run: cp env.example .env"
    exit 1
fi

source .env

MISSING=0

check_var() {
    if [ -z "${!1}" ]; then
        echo "❌ $1 is not set"
        MISSING=1
    else
        echo "✅ $1 is set"
    fi
}

echo ""
echo "Required variables:"
check_var "TELEGRAM_BOT_TOKEN"
check_var "DATABASE_URL"
check_var "OPENAI_API_KEY"
check_var "REPLICATE_API_TOKEN"

echo ""
echo "Optional variables:"
check_var "MINIO_ENDPOINT"
check_var "MINIO_PORT"
check_var "MINIO_ACCESS_KEY"
check_var "MINIO_SECRET_KEY"

echo ""
if [ $MISSING -eq 0 ]; then
    echo "✅ All required variables are set!"
    exit 0
else
    echo "❌ Some required variables are missing!"
    echo "Please edit .env and set all required variables."
    exit 1
fi

