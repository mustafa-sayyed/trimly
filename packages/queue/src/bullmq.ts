import { Queue } from "bullmq";
import type { Redis } from "ioredis";
import { logger } from "./logger.js";
export function getAnalyticsQueue(redis: Redis) {
  const connection = redis;

  const analyticsQueue = new Queue("Analytics Queue", {
    connection,
    defaultJobOptions: {
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    },
  });

  analyticsQueue.on("error", (err) => {
    logger.error("BullMQ Queue error", { error: err });
  });

  analyticsQueue.on("ioredis:close", () => {
    logger.error("BullMQ Queue connection closed, ioredis connection closed");
  });

  return analyticsQueue;
}
