import { Queue } from "bullmq";
import { redis } from "./redis.js";
import { logger } from "./winston.js";

const getAnalyticsQueue = () => {
  const analyticsQueue = new Queue("Analytics Queue", {
    connection: {
      ...redis,
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
    logger.error("BullMQ Queue error: ", { error: err });
  });

  analyticsQueue.on("ioredis:close", () => {
    logger.error("BullMQ Queue connection closed, ioredis connection closed");
  });

  return analyticsQueue;
};

export { getAnalyticsQueue };
