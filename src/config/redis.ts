// src/config/redis.ts
import Redis from 'ioredis';
import { env } from './env';

export const redis = new Redis(env.REDIS_URL, {
  retryStrategy: (times) => {
    // Retry after 1, 2, 4, 8, 16, 32 seconds...
    const delay = Math.min(times * 500, 20000);
    return delay;
  },
  maxRetriesPerRequest: 3,
});