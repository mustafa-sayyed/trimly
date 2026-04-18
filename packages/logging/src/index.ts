import winston, { format } from "winston";
import { getLoggingConfig } from "@packages/config";

const { combine, timestamp, json, colorize, printf, errors } = format;

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

const createConsoleFormat = (isDevelopment: boolean) => {
  return isDevelopment
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
};

export interface LoggerOptions {
  level?: string;
  transports: winston.transport[];
}

export const createLogger = ({ level, transports }: LoggerOptions) => {
  const { isDevelopment } = getLoggingConfig();

  return winston.createLogger({
    level: level ?? (isDevelopment ? "debug" : "info"),
    format: createConsoleFormat(isDevelopment),
    transports,
  });
};

export { winston };
