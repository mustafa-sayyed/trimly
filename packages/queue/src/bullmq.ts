import { Queue } from "bullmq";
import type { Redis } from "ioredis";
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
    console.error("BullMQ Queue error: ", err);
  });

  analyticsQueue.on("ioredis:close", () => {
    console.error("BullMQ Queue connection closed, ioredis connection closed");
  });

  return analyticsQueue;
}
