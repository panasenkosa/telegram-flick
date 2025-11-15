import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { env } from '../config/env.js';
import { handleStart } from './handlers/start.js';
import { handleHelp } from './handlers/help.js';
import { handleBalance } from './handlers/balance.js';
import { 
  handleBuy, 
  handleBuyCallback, 
  handlePreCheckoutQuery, 
  handleSuccessfulPayment 
} from './handlers/payment.js';
import { 
  handleGenerate, 
  handlePhotoReceived, 
  handleCancel 
} from './handlers/generate.js';
import { loggingMiddleware } from './middlewares/logging.js';
import { errorMiddleware } from './middlewares/error.js';

import { Agent } from 'node:https'


export function createBot(): Telegraf {
  const bot = new Telegraf(env.TELEGRAM_BOT_TOKEN, {
    telegram: { agent: new Agent({ keepAlive: false }) }
  });

  // Middlewares
  bot.use(loggingMiddleware());

  // Command handlers
  bot.command('start', handleStart);
  bot.command('help', handleHelp);
  bot.command('balance', handleBalance);
  bot.command('buy', handleBuy);
  bot.command('generate', handleGenerate);
  bot.command('cancel', handleCancel);

  // Callback query handlers
  bot.action(/^buy_\d+$/, handleBuyCallback);

  // Payment handlers
  bot.on('pre_checkout_query', handlePreCheckoutQuery);
  bot.on(message('successful_payment'), handleSuccessfulPayment);

  // Photo handler
  bot.on(message('photo'), async (ctx) => {
    await handlePhotoReceived(ctx, bot);
  });

  // Error handler
  bot.catch(errorMiddleware);

  return bot;
}

