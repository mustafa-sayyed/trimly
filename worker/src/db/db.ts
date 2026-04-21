import { getDatabaseConfig } from "@packages/config";
import { createPrisma } from "@packages/db";

const dbConfig = getDatabaseConfig();

const prisma = createPrisma(dbConfig.DATABASE_URL);

export { prisma };
