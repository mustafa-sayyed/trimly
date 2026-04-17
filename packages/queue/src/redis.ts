import { Redis } from "ioredis";

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
}

const createRedisClient = (config: RedisConfig) => {
  const redis = new Redis({
    host: config.host,
    port: config.port,
    password: config.password,
    db: config.db || 0,
    lazyConnect: true,
    maxRetriesPerRequest: 3,
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 100, 2000);
      return delay;
    },
  });

  redis.on("error", (error) => {
    console.error("Redis error", error);
  });

  return redis;
};

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

export { createRedisClient, redisKeys, CACHE_TTL, key };
export type { Redis };
