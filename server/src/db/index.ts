import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client.js";
import { config } from "../config/config.js";

const adapter = new PrismaPg({ connectionString: config.databaseUrl });

const prisma = new PrismaClient({ adapter });

export { prisma };
