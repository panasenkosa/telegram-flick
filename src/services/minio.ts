import * as Minio from 'minio';
import { env } from '../config/env.js';
import { Readable } from 'stream';

let minioClient: Minio.Client | null = null;

export function getMinioClient(): Minio.Client {
  if (!minioClient) {
    minioClient = new Minio.Client({
      endPoint: env.MINIO_ENDPOINT,
      port: env.MINIO_PORT,
      useSSL: env.MINIO_USE_SSL,
      accessKey: env.MINIO_ACCESS_KEY,
      secretKey: env.MINIO_SECRET_KEY,
    });
  }
  return minioClient;
}

export async function ensureBucket() {
  const client = getMinioClient();
  const bucketExists = await client.bucketExists(env.MINIO_BUCKET);
  
  if (!bucketExists) {
    await client.makeBucket(env.MINIO_BUCKET, 'us-east-1');
    console.log(`Bucket ${env.MINIO_BUCKET} created successfully`);
  }
}

export async function uploadFile(
  fileName: string, 
  buffer: Buffer, 
  contentType: string = 'application/octet-stream'
): Promise<string> {
  const client = getMinioClient();
  
  await client.putObject(
    env.MINIO_BUCKET,
    fileName,
    buffer,
    buffer.length,
    {
      'Content-Type': contentType,
    }
  );

  // Generate a presigned URL valid for 7 days
  const url = await client.presignedGetObject(env.MINIO_BUCKET, fileName, 7 * 24 * 60 * 60);
  return url;
}

export async function uploadStream(
  fileName: string, 
  stream: Readable, 
  size: number,
  contentType: string = 'application/octet-stream'
): Promise<string> {
  const client = getMinioClient();
  
  await client.putObject(
    env.MINIO_BUCKET,
    fileName,
    stream,
    size,
    {
      'Content-Type': contentType,
    }
  );

  const url = await client.presignedGetObject(env.MINIO_BUCKET, fileName, 7 * 24 * 60 * 60);
  return url;
}

export async function getFileUrl(fileName: string): Promise<string> {
  const client = getMinioClient();
  return client.presignedGetObject(env.MINIO_BUCKET, fileName, 7 * 24 * 60 * 60);
}

