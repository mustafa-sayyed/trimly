import * as Sentry from "@sentry/node";
import winston from "winston";
import Transport from "winston-transport";
import { config } from "../config/config.js";

const SentryWinstonTransport = Sentry.createSentryWinstonTransport(Transport);

const { combine, timestamp, json, colorize, printf } = winston.format;

const consoleFormat =
  config.NODE_ENV === "development"
    ? combine(
        colorize(),
        timestamp(),
        printf(({ level, message, timestamp, ...meta }) => {
          const metaData = Object.keys(meta).length ? JSON.stringify(meta) : "";
          return `${timestamp} ${level}: ${message}, ${metaData}`;
        }),
      )
    : combine(timestamp(), json());

export const logger = winston.createLogger({
  level: config.NODE_ENV === "development" ? "debug" : "info",
  format: consoleFormat,
  transports: [new winston.transports.Console(), new SentryWinstonTransport()],
});
