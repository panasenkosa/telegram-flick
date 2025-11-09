// Type augmentation for Telegraf context
import { Context as TelegrafContext } from 'telegraf';

export interface Context extends TelegrafContext {
  // Add custom context properties if needed
}

