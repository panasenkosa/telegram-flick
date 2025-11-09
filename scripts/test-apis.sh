#!/bin/bash

# Script to test API connectivity

echo "🧪 Testing API connectivity..."

source .env

# Test PostgreSQL
echo ""
echo "Testing PostgreSQL..."
if psql "$DATABASE_URL" -c "SELECT 1" > /dev/null 2>&1; then
    echo "✅ PostgreSQL connection successful"
else
    echo "❌ PostgreSQL connection failed"
fi

# Test MinIO
echo ""
echo "Testing MinIO..."
if curl -s "http://${MINIO_ENDPOINT}:${MINIO_PORT}/minio/health/live" > /dev/null 2>&1; then
    echo "✅ MinIO is accessible"
else
    echo "❌ MinIO is not accessible"
fi

# Test OpenAI API
echo ""
echo "Testing OpenAI API..."
response=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    https://api.openai.com/v1/models)

if [ "$response" = "200" ]; then
    echo "✅ OpenAI API key is valid"
else
    echo "❌ OpenAI API key is invalid (HTTP $response)"
fi

# Test Replicate API
echo ""
echo "Testing Replicate API..."
response=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Authorization: Token $REPLICATE_API_TOKEN" \
    https://api.replicate.com/v1/models)

if [ "$response" = "200" ]; then
    echo "✅ Replicate API token is valid"
else
    echo "❌ Replicate API token is invalid (HTTP $response)"
fi

echo ""
echo "🎉 API tests complete!"

