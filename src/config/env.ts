// src/config/env.ts
import dotenv from 'dotenv';

dotenv.config();

export const env = {
  NODE_ENV: process.env['NODE_ENV'] || 'development',
  PORT: parseInt(process.env['PORT'] || '3000', 10),
  DATABASE_URL: process.env['DATABASE_URL'] || '',
  REDIS_URL: process.env['REDIS_URL'] || '',
  JWT_SECRET: process.env['JWT_SECRET'] || 'fallback-jwt-secret',
  JWT_EXPIRES_IN: process.env['JWT_EXPIRES_IN'] || '15m',
  REFRESH_TOKEN_SECRET: process.env['REFRESH_TOKEN_SECRET'] || 'fallback-refresh-secret',
  REFRESH_TOKEN_EXPIRES_IN: process.env['REFRESH_TOKEN_EXPIRES_IN'] || '7d',
  AWS_ACCESS_KEY_ID: process.env['AWS_ACCESS_KEY_ID'] || '',
  AWS_SECRET_ACCESS_KEY: process.env['AWS_SECRET_ACCESS_KEY'] || '',
  AWS_REGION: process.env['AWS_REGION'] || 'us-east-1',
  S3_BUCKET_NAME: process.env['S3_BUCKET_NAME'] || 'quiz-images',
  RATE_LIMIT_WINDOW_MS: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000', 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100', 10),
};