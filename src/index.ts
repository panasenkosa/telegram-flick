import { createBot } from './bot/index.js';
import { ensureBucket } from './services/minio.js';
import { prisma } from './services/database.js';
import { logger } from './utils/logger.js';

async function main() {
  logger.info('🚀 Starting Telegram Flick Bot...');

  try {
    // Initialize MinIO bucket
    logger.info('📦 Ensuring MinIO bucket exists...');
    await ensureBucket();
    logger.info('✅ MinIO bucket ready');

    // Test database connection
    logger.info('🗄️  Testing database connection...');
    await prisma.$connect();
    logger.info('✅ Database connected');

    // Create and launch bot
    logger.info('🤖 Initializing bot...');
    const bot = createBot();
    logger.info('✅ Bot instance created');

    // Enable graceful stop
    process.once('SIGINT', async () => {
      logger.info('\n⏹️  SIGINT received, stopping bot...');
      bot.stop('SIGINT');
      await prisma.$disconnect();
      process.exit(0);
    });

    process.once('SIGTERM', async () => {
      logger.info('\n⏹️  SIGTERM received, stopping bot...');
      bot.stop('SIGTERM');
      await prisma.$disconnect();
      process.exit(0);
    });

    // Test bot token first
    logger.info('🔑 Testing bot token...');
    try {
      const botInfo = await bot.telegram.getMe();
      logger.info(`✅ Bot token valid: @${botInfo.username}`);
    } catch (error) {
      logger.error('❌ Invalid bot token or connection failed:', error);
      throw error;
    }

    // Launch bot with timeout
    logger.info('🚀 Launching bot...');
    
    const launchTimeout = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Bot launch timeout after 60 seconds. This usually means:\n' +
          '1. Telegram API is not accessible from Docker container\n' +
          '2. Firewall is blocking outgoing connections\n' +
          '3. Network issues\n\n' +
          'Try running the bot locally outside Docker to test.'));
      }, 60000);
    });
    
    const launchPromise = bot.launch({
      dropPendingUpdates: true,
      allowedUpdates: ['message', 'callback_query', 'pre_checkout_query'],
    });
    
    await Promise.race([launchPromise, launchTimeout]);
    
    logger.info('✅ Bot started successfully!');
    logger.info('🎬 Romantic Flick Bot is now running...');
  } catch (error) {
    logger.error('❌ Failed to start bot:', error);
    process.exit(1);
  }
}

main();

