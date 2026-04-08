import express from "express";
import cors from "cors";
import { config } from "./config/config.js";
import urlRouter from "./routes/url.route.js";
import userRouter from "./routes/user.route.js";
import globalErrorHandler from "./middlewares/errorHandler.middleware.js";
import { validateRequest } from "./middlewares/validation.middleware.js";
import { redirectToOriginalUrl } from "./controllers/url.controller.js";
import { shortCodeParamSchema } from "./validations/url.validation.js";

const app = express();

// Middlewares
app.use(cors({ origin: config.CLIENT_URL, credentials: true }));
app.use(express.json());

// Routes
app.use("/api/v1/urls", urlRouter);
app.use("/api/v1/users", userRouter);
app.get(
  "/:shortCode",
  validateRequest({ params: shortCodeParamSchema }),
  redirectToOriginalUrl,
);

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is healthy..." });
});

// Global Error Handler
app.use(globalErrorHandler);

export default app;
