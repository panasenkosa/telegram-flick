# 🚀 Quick Start Guide

Get your Telegram Flick Bot up and running in 5 minutes!

## Prerequisites

- Node.js 20+
- Docker & Docker Compose (easiest way)
- Or: PostgreSQL + MinIO running locally

## API Keys You Need

1. **Telegram Bot Token** - Get from [@BotFather](https://t.me/botfather)
   - Send `/newbot` to BotFather
   - Follow instructions
   - Copy the token

2. **OpenAI API Key** - Get from [platform.openai.com](https://platform.openai.com/)
   - Sign up/login
   - Go to API Keys
   - Create new key

3. **Replicate API Token** - Get from [replicate.com](https://replicate.com/)
   - Sign up/login
   - Go to Account Settings
   - Copy API token

## Fastest Setup (Docker Compose)

```bash
# 1. Clone repository
git clone <your-repo-url>
cd telegram-flick

# 2. Create .env file
cp env.example .env

# 3. Edit .env and add your API keys
nano .env  # or use any text editor

# Required variables:
TELEGRAM_BOT_TOKEN=<your-bot-token>
OPENAI_API_KEY=<your-openai-key>
REPLICATE_API_TOKEN=<your-replicate-token>

# 4. Start everything!
docker-compose up -d

# 5. Check logs
docker-compose logs -f bot
```

That's it! Your bot is now running! 🎉

## Quick Test

1. Open Telegram
2. Search for your bot by username
3. Send `/start`
4. Try `/generate` with 2 photos

## Stopping the Bot

```bash
docker-compose down
```

## Troubleshooting

### Bot not responding?
```bash
# Check logs
docker-compose logs bot

# Restart bot
docker-compose restart bot
```

### Database issues?
```bash
# Reset database
docker-compose down -v
docker-compose up -d postgres
sleep 10
docker-compose run --rm bot npx prisma db push
docker-compose up -d bot
```

### Need to see what's in the database?
```bash
# Install pnpm locally
npm install -g pnpm
pnpm install

# Open Prisma Studio
pnpm db:studio
```

## Development Mode

Want to develop locally?

```bash
# 1. Install dependencies
npm install -g pnpm
pnpm install

# 2. Start services only (not the bot)
docker-compose up -d postgres minio

# 3. Setup database
pnpm db:push

# 4. Run in dev mode
pnpm dev
```

## Production Deployment

See [SETUP.md](./SETUP.md) for detailed production setup instructions.

## Need Help?

- Check [SETUP.md](./SETUP.md) for detailed setup
- Check [README.md](./README.md) for project overview
- Review logs: `docker-compose logs -f bot`

## What's Next?

- Configure Telegram Stars payments in BotFather
- Set up monitoring and logging
- Configure SSL for production
- Set up automated backups

Happy bot building! 🎬❤️

