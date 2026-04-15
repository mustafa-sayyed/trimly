import * as Sentry from "@sentry/node";
import winston, { format } from "winston";
import Transport from "winston-transport";
import { config } from "../config/config.js";

const SentryWinstonTransport = Sentry.createSentryWinstonTransport(Transport);

const { combine, timestamp, json, colorize, printf, errors } = winston.format;

const errorReplacer = (_key: string, value: unknown): unknown => {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }
  return value;
};

const consoleFormat =
  config.NODE_ENV === "development"
    ? combine(
        errors({ stack: true }),
        colorize(),
        timestamp(),
        printf(({ level, message, timestamp, ...meta }) => {
          const metaData = Object.keys(meta).length
            ? JSON.stringify(meta, errorReplacer, 2)
            : "";
          return `${timestamp} ${level}: ${message} ${metaData}`;
        }),
      )
    : combine(errors({ stack: true }), timestamp(), json());

export const logger = winston.createLogger({
  level: config.NODE_ENV === "development" ? "debug" : "info",
  format: consoleFormat,
  transports: [new winston.transports.Console(), new SentryWinstonTransport()],
});
