import * as Sentry from "@sentry/node";
import { config } from "../config.js";

Sentry.init({
  dsn: config.SENTRY_DSN,
  enableLogs: true,
  sendDefaultPii: true,
});
