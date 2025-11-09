import { Context } from 'telegraf';
import { logger } from '../../utils/logger.js';

export function loggingMiddleware() {
  return async (ctx: Context, next: () => Promise<void>) => {
    const start = Date.now();
    const userId = ctx.from?.id;
    const username = ctx.from?.username;
    const updateType = ctx.updateType;

    logger.debug(`Incoming update: ${updateType} from user ${userId} (@${username})`);

    try {
      await next();
    } finally {
      const duration = Date.now() - start;
      logger.debug(`Update processed in ${duration}ms`);
    }
  };
}

