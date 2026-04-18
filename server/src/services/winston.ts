import * as Sentry from "@sentry/node";
import { createLogger, winston } from "@packages/logging";
import Transport from "winston-transport";

const SentryWinstonTransport = Sentry.createSentryWinstonTransport(Transport);

export const logger = createLogger({
  transports: [new winston.transports.Console(), new SentryWinstonTransport()],
});
