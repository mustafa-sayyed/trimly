import { Queue } from "bullmq";
import type { RedisConfig } from "./redis.js";

export const getAnalyticsQueue = (redisConfig: RedisConfig) => {
  const analyticsQueue = new Queue("Analytics Queue", {
    connection: {
      host: redisConfig.host,
      port: redisConfig.port,
      password: redisConfig.password,
      db: redisConfig.db ?? 0,
      lazyConnect: true,
    },
    defaultJobOptions: {
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    },
  });

  analyticsQueue.on("error", (err) => {
    console.error("BullMQ Queue error: ", err);
  });

  analyticsQueue.on("ioredis:close", () => {
    console.error("BullMQ Queue connection closed, ioredis connection closed");
  });

  return analyticsQueue;
};
