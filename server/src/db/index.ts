import { createPrisma } from "@packages/db";
import { config } from "../config/config.js";

// Keep the singleton in the server layer so env/config loading stays here.
const prisma = createPrisma(config.DATABASE_URL);

export { prisma };
