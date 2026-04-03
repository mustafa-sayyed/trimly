const _config = {
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  CLIENT_URL: process.env.CLIENT_URL,
  NODE_ENV: process.env.NODE_ENV,
};

export const config = Object.freeze(_config);
