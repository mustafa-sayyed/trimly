import { z } from "zod";

const nodeEnvSchema = z.enum(["development", "production"]);

const serverEnvSchema = z.object({
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().min(1),
  CLIENT_URL: z.string().min(1),
  NODE_ENV: nodeEnvSchema.default("development"),
  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  ACCESS_TOKEN_EXPIRY: z.string().min(1),
  REFRESH_TOKEN_EXPIRY: z.string().min(1),
  BASE_URL: z.string().min(1),
  REDIS_PASSWORD: z.string().min(1),
  REDIS_HOST: z.string().min(1),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_DB: z.coerce.number().default(0),
  SENTRY_DSN: z.string().min(1).optional(),
});

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
});

export type ServerConfig = z.infer<typeof serverEnvSchema>;
export type DatabaseConfig = z.infer<typeof databaseEnvSchema>;
export type RedisConfig = z.infer<typeof redisEnvSchema>;
export type LoggingConfig = z.infer<typeof loggingEnvSchema> & {
  isDevelopment: boolean;
};

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

export const getLoggingConfig = (
  env: NodeJS.ProcessEnv = process.env,
): LoggingConfig => {
  const parsed = loggingEnvSchema.parse(env);

  return {
    ...parsed,
    isDevelopment: parsed.NODE_ENV === "development",
  };
};
