# Deployment Guide

## Prerequisites

Before deploying, ensure you have:

1. ✅ Telegram Bot Token
2. ✅ OpenAI API Key
3. ✅ Replicate API Token
4. ✅ Server or hosting platform
5. ✅ Domain name (optional, for production)

## Deployment Options

### Option 1: Docker Compose (Recommended)

Best for: VPS, dedicated servers, cloud instances

**Requirements:**
- Docker 20.10+
- Docker Compose 2.0+
- 2GB RAM minimum
- 10GB disk space

**Steps:**

1. Clone repository on server:
```bash
git clone <your-repo-url>
cd telegram-flick
```

2. Create .env file:
```bash
cp env.example .env
nano .env  # Edit with your credentials
```

3. Start services:
```bash
docker-compose up -d
```

4. Check logs:
```bash
docker-compose logs -f bot
```

5. Set up auto-restart (optional):
```bash
# Add to crontab
@reboot cd /path/to/telegram-flick && docker-compose up -d
```

### Option 2: PM2 (Node.js Process Manager)

Best for: Node.js environments, shared hosting

**Requirements:**
- Node.js 20+
- PostgreSQL
- MinIO
- PM2

**Steps:**

1. Install dependencies:
```bash
pnpm install
```

2. Build project:
```bash
pnpm build
```

3. Set up PM2:
```bash
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'telegram-flick',
    script: './dist/index.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production'
    }
  }]
}
EOF

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set up auto-start on reboot
pm2 startup
```

### Option 3: Cloud Platforms

#### Heroku

1. Create Heroku app:
```bash
heroku create telegram-flick-bot
```

2. Add PostgreSQL:
```bash
heroku addons:create heroku-postgresql:mini
```

3. Set environment variables:
```bash
heroku config:set TELEGRAM_BOT_TOKEN=your_token
heroku config:set OPENAI_API_KEY=your_key
heroku config:set REPLICATE_API_TOKEN=your_token
# Set other variables...
```

4. Deploy:
```bash
git push heroku main
```

#### Railway

1. Create new project on [railway.app](https://railway.app)
2. Add PostgreSQL database
3. Connect GitHub repository
4. Set environment variables in Railway dashboard
5. Deploy automatically on push

#### DigitalOcean App Platform

1. Create new app on [DigitalOcean](https://cloud.digitalocean.com)
2. Connect repository
3. Add PostgreSQL database
4. Configure environment variables
5. Deploy

### Option 4: Kubernetes

Best for: Large scale, high availability

**Requirements:**
- Kubernetes cluster
- kubectl configured
- Helm (optional)

**Steps:**

1. Create namespace:
```bash
kubectl create namespace telegram-flick
```

2. Create secrets:
```bash
kubectl create secret generic telegram-flick-secrets \
  --from-literal=TELEGRAM_BOT_TOKEN=your_token \
  --from-literal=OPENAI_API_KEY=your_key \
  --from-literal=REPLICATE_API_TOKEN=your_token \
  -n telegram-flick
```

3. Create deployment files (see k8s/ directory)

4. Apply configuration:
```bash
kubectl apply -f k8s/ -n telegram-flick
```

## Production Checklist

### Before Deployment

- [ ] All environment variables set correctly
- [ ] Database created and accessible
- [ ] MinIO configured and accessible
- [ ] API keys tested and working
- [ ] Bot token verified with BotFather
- [ ] Telegram Stars payments enabled

### After Deployment

- [ ] Bot responds to /start command
- [ ] Photo upload works
- [ ] Video generation works
- [ ] Payment flow works
- [ ] Logs are accessible
- [ ] Error notifications set up
- [ ] Backup system configured
- [ ] Monitoring set up

## Monitoring and Logging

### Logs

**Docker Compose:**
```bash
# View logs
docker-compose logs -f bot

# Save logs to file
docker-compose logs bot > bot.log
```

**PM2:**
```bash
# View logs
pm2 logs telegram-flick

# View specific log files
pm2 logs telegram-flick --lines 100
```

### Monitoring Tools

1. **Simple monitoring script:**
```bash
#!/bin/bash
while true; do
  if ! docker ps | grep telegram-flick_bot; then
    echo "Bot is down! Restarting..."
    docker-compose restart bot
  fi
  sleep 60
done
```

2. **UptimeRobot** - External monitoring
3. **Sentry** - Error tracking
4. **Prometheus + Grafana** - Metrics

## Backup Strategy

### Database Backup

**Automated daily backup:**
```bash
#!/bin/bash
# backup-db.sh
DATE=$(date +%Y%m%d_%H%M%S)
docker exec telegram-flick_postgres_1 pg_dump -U postgres telegram_flick > backup_$DATE.sql
# Upload to S3 or keep locally
```

Add to crontab:
```
0 2 * * * /path/to/backup-db.sh
```

### MinIO Backup

Use MinIO's built-in replication or:
```bash
mc mirror minio/telegram-flick backup-location/telegram-flick
```

## Scaling

### Horizontal Scaling

1. **Use load balancer**
2. **Multiple bot instances**
3. **Shared PostgreSQL**
4. **Shared MinIO/S3**
5. **Redis for sessions**

### Vertical Scaling

Increase resources based on load:
- 2GB RAM → 4GB RAM
- 1 CPU → 2 CPUs
- 10GB disk → 50GB disk

## Security Best Practices

1. **Environment Variables**
   - Never commit .env
   - Use secrets management (Vault, AWS Secrets Manager)
   - Rotate keys regularly

2. **Network Security**
   - Use firewall rules
   - Limit database access
   - Use private networks

3. **SSL/TLS**
   - Use HTTPS for webhooks (if applicable)
   - Secure MinIO with SSL
   - Database SSL connections

4. **Updates**
   - Keep dependencies updated
   - Monitor security advisories
   - Apply patches promptly

## Troubleshooting

### Bot not starting

1. Check logs:
```bash
docker-compose logs bot
```

2. Verify environment variables
3. Test database connection
4. Test MinIO connection

### High memory usage

1. Check for memory leaks
2. Limit concurrent operations
3. Implement cleanup routines
4. Increase memory allocation

### Slow performance

1. Add database indexes
2. Optimize queries
3. Implement caching
4. Scale resources

### API rate limits

1. Implement rate limiting
2. Queue requests
3. Use exponential backoff
4. Monitor API usage

## Rollback Procedure

If deployment fails:

1. **Docker Compose:**
```bash
docker-compose down
git checkout previous-tag
docker-compose up -d
```

2. **PM2:**
```bash
pm2 stop telegram-flick
git checkout previous-tag
pnpm build
pm2 restart telegram-flick
```

3. **Database rollback:**
```bash
psql -U postgres telegram_flick < backup_YYYYMMDD.sql
```

## Cost Estimation

### Small Scale (< 100 users/day)
- VPS: $5-10/month
- OpenAI: $5-20/month
- Replicate: $10-30/month
- **Total: ~$20-60/month**

### Medium Scale (100-1000 users/day)
- VPS: $20-50/month
- OpenAI: $50-200/month
- Replicate: $100-500/month
- **Total: ~$170-750/month**

### Large Scale (1000+ users/day)
- Cloud infrastructure: $100-500/month
- OpenAI: $200-1000/month
- Replicate: $500-2000/month
- **Total: ~$800-3500/month**

## Support and Maintenance

### Regular Maintenance

- [ ] Weekly: Check logs for errors
- [ ] Weekly: Review user feedback
- [ ] Monthly: Update dependencies
- [ ] Monthly: Review API costs
- [ ] Quarterly: Security audit
- [ ] Yearly: Infrastructure review

### Emergency Contacts

Keep contact information for:
- Hosting provider support
- OpenAI support
- Replicate support
- On-call developer

## Next Steps

After successful deployment:

1. Set up monitoring and alerts
2. Configure automated backups
3. Document custom procedures
4. Train team on operations
5. Plan for scaling
6. Implement A/B testing
7. Gather user feedback
8. Optimize costs

