import "dotenv/config";
import app from "./src/app.js";
import { prisma } from "./src/db/index.js";
import { config } from "./src/config/config.js";
import { redis } from "./src/services/redis.js";
import { logger } from "./src/services/winston.js";

const PORT = config.PORT;

const closeConnections = async () => {
  await prisma.$disconnect().catch((error: unknown) => {
    logger.error("Failed to disconnect prisma", { error });
  });

  if (redis.status !== "end") {
    await redis.quit().catch((error: unknown) => {
      logger.warn("Redis quit failed, forcing redis to disconnect", {
        error,
        redisStatus: redis.status,
      });
      redis.disconnect();
    });
  }
};

prisma
  .$connect()
  .then(async () => {
    await prisma.$queryRaw`SELECT 1`
      .catch((error: unknown) => {
        logger.error("Database connection test failed", { error });
        logger.error("Database connection failed", { error });
        throw error;
      })
      .then(() => {
        logger.info("Database connection test successful");
        logger.info("Database connected successfully");
      });

    await redis.connect();
    const pong = await redis.ping();
    logger.info("Redis connection successful", {
      pong,
      redisStatus: redis.status,
    });

    app.listen(PORT, () => {
      logger.info("Server is running", { port: PORT });
    });
  })
  .catch(async (err: unknown) => {
    logger.error("Failed to start server", { error: err });
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
