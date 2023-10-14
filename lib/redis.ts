import { Redis } from '@upstash/redis'

if (!process.env.UPSTASH_REDIS_REST_URL) {
  throw new Error('Missing Redis URL');
}

if (!process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('Missing Redis token'); 
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})