import { Queue, Worker, type Processor, type WorkerOptions } from "bullmq";
import type { Redis } from "ioredis";
import { logger } from "./logger.js";

const QUEUE_NAME = "Analytics Queue";

export function getAnalyticsQueue(redis: Redis) {
  const connection = redis;

  const analyticsQueue = new Queue(QUEUE_NAME, {
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

export const createAnalyticsWorker = (
  processor: Processor,
  options: WorkerOptions,
): Worker => {
  const analyticsWorker = new Worker(QUEUE_NAME, processor, options);

  return analyticsWorker;
};
