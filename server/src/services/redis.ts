import { createRedisClient, redisKeys, CACHE_TTL, key } from "@packages/queue";
import { config } from "../config/config.js";
import { logger } from "./winston.js";

const redis = createRedisClient({
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
  password: config.REDIS_PASSWORD,
  db: config.REDIS_DB,
});

redis.on("error", (error: unknown) => {
  logger.error("Redis error", { error });
});

export { redis, redisKeys, CACHE_TTL, key };
