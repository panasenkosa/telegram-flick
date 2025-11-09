# Setup Guide for Telegram Flick Bot

## Prerequisites

### 1. Create Telegram Bot
1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Send `/newbot` command
3. Follow the instructions to create your bot
4. Save the bot token you receive

### 2. Enable Telegram Stars Payments
1. In BotFather, send `/mybots`
2. Select your bot
3. Go to "Bot Settings" → "Payments"
4. Enable Telegram Stars

### 3. Get OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Save the key securely

### 4. Get Replicate API Token
1. Go to [Replicate](https://replicate.com/)
2. Sign up or log in
3. Go to your account settings
4. Find API tokens section
5. Create a new token
6. Save the token securely

### 5. Install PostgreSQL
#### macOS (using Homebrew):
```bash
brew install postgresql@16
brew services start postgresql@16
```

#### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### Windows:
Download and install from [PostgreSQL Downloads](https://www.postgresql.org/download/windows/)

### 6. Install MinIO (Development)
#### Using Docker:
```bash
docker run -d \
  -p 9000:9000 \
  -p 9001:9001 \
  --name minio \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin" \
  minio/minio server /data --console-address ":9001"
```

#### Or download from [MinIO Downloads](https://min.io/download)

## Installation

### Option 1: Local Development

1. **Clone and install dependencies:**
```bash
cd telegram-flick
npm install -g pnpm
pnpm install
```

2. **Create database:**
```bash
createdb telegram_flick
```

3. **Set up environment variables:**
```bash
cp env.example .env
```

Edit `.env` with your credentials:
```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
DATABASE_URL=postgresql://postgres:password@localhost:5432/telegram_flick?schema=public
OPENAI_API_KEY=sk-your_openai_key
REPLICATE_API_TOKEN=r8_your_replicate_token
```

4. **Run database migrations:**
```bash
pnpm db:generate
pnpm db:push
```

5. **Start the bot:**
```bash
# Development mode (with auto-reload)
pnpm dev

# Production mode
pnpm build
pnpm start
```

### Option 2: Docker Compose (Recommended for Production)

1. **Set up environment variables:**
```bash
cp env.example .env
```

Edit `.env` with your API credentials (DATABASE_URL will be handled by Docker).

2. **Run setup script:**
```bash
chmod +x scripts/docker-setup.sh
./scripts/docker-setup.sh
```

Or manually:
```bash
docker-compose up -d postgres minio
sleep 10
docker-compose run --rm bot npx prisma db push
docker-compose up -d bot
```

3. **View logs:**
```bash
docker-compose logs -f bot
```

### Option 3: Docker (Custom Setup)

1. **Build image:**
```bash
docker build -t telegram-flick .
```

2. **Run with your database and MinIO:**
```bash
docker run -d \
  --env-file .env \
  --name telegram-flick-bot \
  telegram-flick
```

## Verification

1. **Test bot connection:**
   - Open Telegram
   - Search for your bot by username
   - Send `/start` command
   - You should receive a welcome message

2. **Test MinIO connection:**
   - Open http://localhost:9001 in browser
   - Login with minioadmin/minioadmin
   - You should see the MinIO console

3. **Test database connection:**
```bash
# Using psql
psql -d telegram_flick -c "SELECT * FROM users;"

# Using Prisma Studio
pnpm db:studio
```

## Troubleshooting

### Bot not responding
- Check if bot token is correct in `.env`
- Verify bot is running: `docker-compose logs bot` or check process
- Ensure no network firewall blocking Telegram API

### Database connection errors
- Verify PostgreSQL is running
- Check DATABASE_URL in `.env`
- Ensure database exists: `psql -l`

### MinIO connection errors
- Verify MinIO is running: `docker ps`
- Check MinIO credentials in `.env`
- Try accessing console: http://localhost:9001

### OpenAI/Replicate errors
- Verify API keys are correct
- Check API quotas/limits
- Ensure APIs are accessible from your network

### Photo upload fails
- Check MinIO is running and accessible
- Verify bucket exists or can be created
- Check MinIO credentials

## Development Tips

1. **Use Prisma Studio to view database:**
```bash
pnpm db:studio
```

2. **Watch logs in development:**
```bash
pnpm dev
```

3. **Reset database (careful!):**
```bash
pnpm db:push --force-reset
```

4. **Test payments (use Telegram's test environment):**
   - Create test bot via BotFather
   - Use test payment methods

## Production Deployment

1. **Set proper environment variables:**
   - Use strong database passwords
   - Use production MinIO setup with SSL
   - Set NODE_ENV=production

2. **Use process manager (PM2):**
```bash
npm install -g pm2
pm2 start dist/index.js --name telegram-flick
pm2 save
pm2 startup
```

3. **Set up monitoring and logging**

4. **Configure SSL for MinIO in production**

5. **Set up automated backups for PostgreSQL**

## Support

For issues and questions, check:
- Bot logs: `docker-compose logs bot`
- Database: `pnpm db:studio`
- MinIO Console: http://localhost:9001

## Next Steps

After setup is complete:
1. Test the bot with `/start`
2. Try generating a video with `/generate`
3. Test payment flow with `/buy`
4. Monitor logs for any errors
5. Set up proper production environment if needed

