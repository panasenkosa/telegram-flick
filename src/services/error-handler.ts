import { Context } from 'telegraf';
import { logger } from '../utils/logger.js';

export class BotError extends Error {
  constructor(
    message: string,
    public userMessage: string,
    public code?: string
  ) {
    super(message);
    this.name = 'BotError';
  }
}

export async function handleError(error: unknown, ctx?: Context) {
  logger.error('Error occurred:', error);

  if (ctx) {
    if (error instanceof BotError) {
      await ctx.reply(`❌ ${error.userMessage}`).catch(console.error);
    } else if (error instanceof Error) {
      await ctx.reply(
        '❌ Произошла неожиданная ошибка. Пожалуйста, попробуйте позже или используйте /cancel для сброса.'
      ).catch(console.error);
    }
  }
}

export function createUserFriendlyError(error: unknown): string {
  if (error instanceof BotError) {
    return error.userMessage;
  }

  if (error instanceof Error) {
    // Map common errors to user-friendly messages
    if (error.message.includes('network')) {
      return 'Проблема с сетью. Пожалуйста, попробуйте позже.';
    }
    if (error.message.includes('timeout')) {
      return 'Превышено время ожидания. Попробуйте еще раз.';
    }
    if (error.message.includes('rate limit')) {
      return 'Превышен лимит запросов. Подождите немного и попробуйте снова.';
    }
  }

  return 'Произошла ошибка. Пожалуйста, попробуйте позже.';
}

