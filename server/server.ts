import "dotenv/config";
import app from "./src/app.js";
import { prisma } from "./src/db/index.js";

const PORT = process.env.PORT || 5000;

prisma
  .$connect()
  .then(() => {
    console.log(`Database connected successfully`);
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(async (err) => {
    console.error("Failed to connect to the database:", err);
    await prisma.$disconnect();
    process.exit(1);
  });

process.on("SIGINT", async () => {
  console.log("Gracefully shutting down...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Gracefully shutting down...");
  await prisma.$disconnect();
  process.exit(0);
});
