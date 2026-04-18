import * as Sentry from "@sentry/node";
import { createLogger, winston } from "@packages/logging";
import Transport from "winston-transport";
import { config } from "../config/config.js";

const SentryWinstonTransport = Sentry.createSentryWinstonTransport(Transport);

export const logger = createLogger({
  isDevelopment: config.NODE_ENV === "development",
  transports: [new winston.transports.Console(), new SentryWinstonTransport()],
});
