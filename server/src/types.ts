import type { Request } from "express";

interface TokenPayload {
  id: number;
  email: string;
  name: string;
}

interface ApiError extends Error {
  statusCode?: number;
  success?: boolean;
}

interface User {
  id: number;
  email: string;
  name: string;
}

interface AuthenticatedRequest extends Request {
  user: User;
  accessToken: string;
}

export type { TokenPayload, ApiError, User, AuthenticatedRequest };
