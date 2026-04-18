import { createLogger, winston } from "@packages/logging";

export const logger = createLogger({
  isDevelopment: process.env.NODE_ENV === "development",
  transports: [new winston.transports.Console()],
});
