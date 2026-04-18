import { createLogger, winston } from "@packages/logging";

export const logger = createLogger({
  transports: [new winston.transports.Console()],
});
