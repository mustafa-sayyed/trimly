import { createRedisClient } from "@packages/queue";
import { config } from "./config.js";
import { createAnalyticsWorker } from "@packages/queue";
import { prisma } from "./db/db.js";
import { logger } from "./services/logger.js";

const redis = createRedisClient({
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
  db: config.REDIS_DB,
  password: config.REDIS_PASSWORD,
});

redis.on("error", (error) => {
  logger.error("Redis error", { error });
});

const analyticsWorker = createAnalyticsWorker(
  async (job) => {
    logger.info("Processing job", { jobId: job.id, jobData: job.data });

    await prisma.analytics.create({
      data: job.data,
    });

    logger.info("Job completed successfully", { jobId: job.id });

    return { success: true };
  },
  {
    connection: redis,
    autorun: false,
    settings: {
      backoffStrategy: (attempts, type, err, job) => {
        logger.error("BullMQ Worker job failed", {
          error: err,
          jobId: job?.id,
          jobData: job?.data,
          attempts,
          type,
        });

        const exponentialDealy = Math.min(1000 * attempts, 30000);
        return Math.floor(exponentialDealy * Math.random());
      },
    },
  },
);

export { redis, analyticsWorker };
