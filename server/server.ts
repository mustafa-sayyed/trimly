import "dotenv/config";
import app from "./src/app.js";
import { prisma } from "./src/db/index.js";
import { redis } from "./src/utils/redis.util.js";

const PORT = process.env.PORT || 5000;

prisma
  .$connect()
  .then(async () => {
    console.log(`Database connected successfully`);
    
    await redis.connect();
    const pong = await redis.ping();
    console.log("Redis connection successful:", pong);

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(async (err) => {
    console.error("Failed to start Server:", err);
    await prisma.$disconnect();
    await redis.quit();
    process.exit(1);
  });

redis.on("error", (error) => {
  console.log("Redis Error: ", error);
})

process.on("SIGINT", async () => {
  console.log("Gracefully shutting down...");
  await prisma.$disconnect();
  await redis.quit();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Gracefully shutting down...");
  await prisma.$disconnect();
  await redis.quit();
  process.exit(0);
});
