import type { Request, Response, NextFunction } from "express";
import { config } from "../config/config.js";
import type { ApiError } from "../types.js";
import { logger } from "../services/winston.js";

const globalErrorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.error(err.message, {
    statusCode: err.statusCode,
    stack: err.stack,
  });
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const error = config.NODE_ENV === "development" ? err : undefined;

  res.status(statusCode).json({
    success: false,
    message,
    error,
  });
};

export default globalErrorHandler;
