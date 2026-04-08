import { z } from "zod";

export const shortCodeSchema = z
  .string()
  .trim()
  .min(1, "Short code is required")
  .max(50, "Short code is too long")
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "Short code can only contain letters, numbers, hyphens, and underscores",
  );

export const urlSchema = z.url("Please provide a valid URL").trim();

export const optionalDateSchema = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.date().optional(),
);
