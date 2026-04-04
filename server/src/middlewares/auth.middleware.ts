import type { RequestHandler } from "express";
import { verifyAccessToken } from "../utils/jwt.util.js";
import ApiError from "../utils/ApiError.util.js";
import httpStatusCodes from "../utils/httpStatusCodes.util.js";
import type { User } from "../types.js";

/**
 * Extend Express Request to include user data
 */
declare global {
  namespace Express {
    interface Request {
      user?: User;
      accessToken?: string;
    }
  }
}

export const verifyJWT: RequestHandler = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      throw new ApiError(
        httpStatusCodes.UNAUTHORIZED,
        "Unauthorized, No token provided",
      );
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      throw new ApiError(
        httpStatusCodes.UNAUTHORIZED,
        "Invalid or expired token",
      );
    }

    req.user = payload;
    req.accessToken = token;

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res
      .status(httpStatusCodes.UNAUTHORIZED)
      .json({ message: "Authentication failed" });
  }
};
