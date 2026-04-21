import { createRedisClient } from "@packages/queue";
import { config } from "./redis.js";

const redis = createRedisClient({
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
  db: config.REDIS_DB,
  password: config.REDIS_PASSWORD,
});

redis.on("error", (error) => {
  console.error("Redis error:", error);
});

export { redis };
