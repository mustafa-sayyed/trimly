import * as Sentry from "@sentry/node";
import { config } from "../config/config.js";

Sentry.init({
  dsn: config.SENTRY_DSN,
  enableLogs: true,
  sendDefaultPii: true,
});
