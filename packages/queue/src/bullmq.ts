import { Queue } from "bullmq";
import type { Redis } from "ioredis";

export const getAnalyticsQueue = (redis: Redis) => {
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
    console.error("BullMQ Queue error: ", err);
  });

  analyticsQueue.on("ioredis:close", () => {
    console.error("BullMQ Queue connection closed, ioredis connection closed");
  });

  return analyticsQueue;
};
