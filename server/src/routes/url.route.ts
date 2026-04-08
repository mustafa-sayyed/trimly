import { Router } from "express";
import {
  createShortUrl,
  deleteUrl,
  getAllUrls,
  getUrlAnalytics,
  getUrlByShortCode,
  redirectToOriginalUrl,
  updateUrl,
} from "../controllers/url.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validation.middleware.js";
import {
  createShortUrlSchema,
  shortCodeParamSchema,
  updateShortUrlSchema,
} from "../validations/index.js";

const router = Router();

router.post(
  "/",
  verifyJWT,
  validateRequest({ body: createShortUrlSchema }),
  createShortUrl,
);
router.get("/", verifyJWT, getAllUrls);
router.get(
  "/code/:shortCode",
  validateRequest({ params: shortCodeParamSchema }),
  getUrlByShortCode,
);
router.patch(
  "/:shortCode",
  verifyJWT,
  validateRequest({ params: shortCodeParamSchema, body: updateShortUrlSchema }),
  updateUrl,
);
router.delete(
  "/:shortCode",
  verifyJWT,
  validateRequest({ params: shortCodeParamSchema }),
  deleteUrl,
);
router.get(
  "/analytics/:shortCode",
  verifyJWT,
  validateRequest({ params: shortCodeParamSchema }),
  getUrlAnalytics,
);
router.get(
  "/r/:shortCode",
  validateRequest({ params: shortCodeParamSchema }),
  redirectToOriginalUrl,
);

export default router;
