import { getAnalyticsQueue as createAnalyticsQueue } from "@packages/queue";
import { redis } from "./redis.js";
import { logger } from "./winston.js";

const getAnalyticsQueue = () => {
  const analyticsQueue = createAnalyticsQueue(redis);

  analyticsQueue.on("error", (err: unknown) => {
    logger.error("BullMQ Queue error: ", { error: err });
  });

  analyticsQueue.on("ioredis:close", () => {
    logger.error("BullMQ Queue connection closed, ioredis connection closed");
  });

  return analyticsQueue;
};

export { getAnalyticsQueue };
