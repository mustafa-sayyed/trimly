import "dotenv/config";
import "./src/services/sentry.js";
import { prisma } from "./src/db/db.js";
import { analyticsWorker } from "./src/worker.js";
import { logger } from "./src/services/logger.js";

async function closeConnections() {
  try {
    await prisma.$disconnect();
    await analyticsWorker.close();
  } catch (error) {
    logger.error("Error while closing connections", { error });
    process.exit(1);
  }
}

prisma
  .$connect()
  .then(async () => {
    await prisma.$queryRaw`SELECT 1`
      .catch((error: unknown) => {
        logger.error("Database connection test failed", { error });
        logger.error("Database connection failed", { error });
        throw error;
      })
      .then(async () => {
        logger.info("Database connection test successful");
        logger.info("Database connected successfully");
      });

    await analyticsWorker.run();
  })
  .catch(async (err) => {
    logger.error("Failed to connect to the database", { error: err });
    await closeConnections();
    process.exit(1);
  });

process.on("SIGINT", async () => {
  logger.info("Gracefully shutting down", { signal: "SIGINT" });
  await closeConnections();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  logger.info("Gracefully shutting down", { signal: "SIGTERM" });
  await closeConnections();
  process.exit(0);
});
