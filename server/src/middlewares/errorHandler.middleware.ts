import type { Request, Response, NextFunction } from "express";
import { config } from "../config/config.js";

interface ApiError extends Error {
  statusCode?: number;
  success?: boolean;
}

const globalErrorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log(err);
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
