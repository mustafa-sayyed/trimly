import { Redis } from "ioredis";
import { config } from "../config/config.js";

const redis = new Redis({
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
  password: config.REDIS_PASSWORD,
  db: config.REDIS_DB,
  lazyConnect: true,
  maxRetriesPerRequest: 3,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 100, 2000);
    return delay;
  },
});

const key = (...args: Array<string | number>) => {
  return args.join(":");
};

const redisKeys = {
  user: (userId: string | number) => key("user", userId),
  url: (shortCode: string | number) => key("url", shortCode),
  analytics: (shortCode: string) => key("analytics", shortCode),
  allUrls: (userId: string | number) => key("urls", userId),
  custom: (...args: Array<string | number>) => key("custom", ...args),
};

// TTL constants in seconds
const CACHE_TTL = {
  USER_DATA: 60 * 60,
  USER_URLS: 30 * 60,
  URL_DETAILS: 60 * 60,
  ANALYTICS: 60 * 60,
  SHORT_CODE_REDIRECT: 24 * 60 * 60,
};

export { redis, redisKeys, CACHE_TTL, key };
