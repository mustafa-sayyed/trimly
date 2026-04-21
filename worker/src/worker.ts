import { createAnalyticsWorker } from "@packages/queue";
import { config } from "./config.js";
import { prisma } from "./db/db.js";
import { logger } from "./services/logger.js";

const analyticsWorker = createAnalyticsWorker(
  async (job) => {
    logger.info("Processing job", { jobId: job.id, jobData: job.data });

    try {
      await prisma.analytics.create({
        data: {
          url_id: job.data.url_id,
          ip_address: job.data.ip_address,
          click_at: job.data.click_at,
          user_agent: job.data.user_agent,
          referrer: job.data.referrer,
        },
      });
    } catch (error) {
      logger.error("Error processing job", {
        error,
        jobId: job.id,
        jobData: job.data,
      });
      throw error;
    }

    logger.info("Job completed successfully", { jobId: job.id });

    return { success: true };
  },
  {
    connection: {
      host: config.REDIS_HOST,
      port: config.REDIS_PORT,
      db: config.REDIS_DB,
      password: config.REDIS_PASSWORD,
    },
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

        const exponentialDelay = Math.min(1000 * attempts, 30000);
        return Math.floor(exponentialDelay * Math.random());
      },
    },
  },
);

analyticsWorker.on("ready", () => {
  logger.info("Analytics Worker is ready...");
});

analyticsWorker.on("failed", (job, err) => {
  logger.error("Analytics Worker job failed", {
    error: err,
    jobId: job?.id,
    jobData: job?.data,
  });
});

analyticsWorker.on("error", (err) => {
  logger.error("BullMQ Worker error", { error: err });
});

analyticsWorker.on("ioredis:close", () => {
  logger.error("BullMQ Worker connection closed, ioredis connection closed");
});

export { analyticsWorker };
