import { Context } from 'telegraf';
import { handleError } from '../../services/error-handler.js';

export async function errorMiddleware(err: unknown, ctx: Context) {
  await handleError(err, ctx);
}

