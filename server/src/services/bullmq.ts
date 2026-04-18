import { getAnalyticsQueue as createAnalyticsQueue } from "@packages/queue";
import { config } from "../config/config.js";
import { logger } from "./winston.js";

let analyticsQueue: ReturnType<typeof createAnalyticsQueue> | null = null;

const getAnalyticsQueue = () => {
  if (analyticsQueue) {
    return analyticsQueue;
  }

  analyticsQueue = createAnalyticsQueue({
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
    password: config.REDIS_PASSWORD,
    db: config.REDIS_DB,
  });

  analyticsQueue.on("error", (err: unknown) => {
    logger.error("BullMQ Queue error: ", { error: err });
  });

  analyticsQueue.on("ioredis:close", () => {
    logger.error("BullMQ Queue connection closed, ioredis connection closed");
  });

  return analyticsQueue;
};

export { getAnalyticsQueue };
