import { z } from "zod";
import {
  optionalDateSchema,
  shortCodeSchema,
  urlSchema,
} from "./common.validation.js";

export const createShortUrlSchema = z
  .object({
    url: urlSchema,
    customShortCode: shortCodeSchema.optional(),
    expiresAt: optionalDateSchema,
  })
  .strict();

export const updateShortUrlSchema = z
  .object({
    long_url: urlSchema,
    expires_at: optionalDateSchema,
  })
  .strict();

export const shortCodeParamSchema = z
  .object({
    shortCode: shortCodeSchema,
  })
  .strict();
