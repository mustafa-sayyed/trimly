import { z } from "zod";

export const registerUserSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters long"),
    email: z.email("Please provide a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
  })
  .strict();

export const loginUserSchema = z
  .object({
    email: z.email("Please provide a valid email address"),
    password: z.string().min(1, "Password is required"),
  })
  .strict();

export const refreshTokenSchema = z
  .object({
    refreshToken: z.string().min(1, "Refresh token is required"),
  })
  .strict();
