import { z } from "zod";
import { is } from "zod/locales";

const nodeEnvSchema = z.enum(["development", "production"]);

const databaseEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
});

const redisEnvSchema = z.object({
  REDIS_PASSWORD: z.string().min(1),
  REDIS_HOST: z.string().min(1),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_DB: z.coerce.number().default(0),
});

const loggingEnvSchema = z.object({
  NODE_ENV: nodeEnvSchema.default("development"),
  isDevelopment: z.boolean().default(true),
});

const serverEnvSchema = z.object({
  PORT: z.coerce.number().default(5000),
  CLIENT_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  ACCESS_TOKEN_EXPIRY: z.string().min(1),
  REFRESH_TOKEN_EXPIRY: z.string().min(1),
  BASE_URL: z.string().min(1),
  SENTRY_DSN: z.string().min(1).optional(),
  ...databaseEnvSchema.shape,
  ...redisEnvSchema.shape,
  ...loggingEnvSchema.shape,
});

const workerEnvSchema = z.object({
  PORT: z.coerce.number().default(5001),
  ...databaseEnvSchema.shape,
  ...redisEnvSchema.shape,
  ...loggingEnvSchema.shape,
});

export type ServerConfig = z.infer<typeof serverEnvSchema>;
export type DatabaseConfig = z.infer<typeof databaseEnvSchema>;
export type RedisConfig = z.infer<typeof redisEnvSchema>;
export type WorkerConfig = z.infer<typeof workerEnvSchema>;
export type LoggingConfig = z.infer<typeof loggingEnvSchema>;

export const getServerConfig = (
  env: NodeJS.ProcessEnv = process.env,
): ServerConfig => {
  return serverEnvSchema.parse(env);
};

export const getDatabaseConfig = (
  env: NodeJS.ProcessEnv = process.env,
): DatabaseConfig => {
  return databaseEnvSchema.parse(env);
};

export const getRedisConfig = (
  env: NodeJS.ProcessEnv = process.env,
): RedisConfig => {
  return redisEnvSchema.parse(env);
};

export const getWorkerConfig = (
  env: NodeJS.ProcessEnv = process.env,
): WorkerConfig => {
  const parsed = workerEnvSchema.parse(env);

  return {
    ...parsed,
    isDevelopment: parsed.NODE_ENV === "development",
  };
};

export const getLoggingConfig = (
  env: NodeJS.ProcessEnv = process.env,
): LoggingConfig => {
  const parsed = loggingEnvSchema.parse(env);

  return {
    ...parsed,
    isDevelopment: parsed.NODE_ENV === "development",
  };
};
