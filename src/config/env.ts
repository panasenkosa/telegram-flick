import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
  TELEGRAM_BOT_TOKEN: z.string().min(1, 'TELEGRAM_BOT_TOKEN is required'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required'),
  REPLICATE_API_TOKEN: z.string().min(1, 'REPLICATE_API_TOKEN is required'),
  
  MINIO_ENDPOINT: z.string().default('localhost'),
  MINIO_PORT: z.string().transform(Number).default('9000'),
  MINIO_ACCESS_KEY: z.string().default('minioadmin'),
  MINIO_SECRET_KEY: z.string().default('minioadmin'),
  MINIO_USE_SSL: z.string().transform(val => val === 'true').default('false'),
  MINIO_BUCKET: z.string().default('telegram-flick'),
  
  STARS_PRICE: z.string().transform(Number).default('100'),
  FREE_GENERATIONS_LIMIT: z.string().transform(Number).default('1'),
});

export const env = envSchema.parse(process.env);

