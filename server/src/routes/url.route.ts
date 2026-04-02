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

const router = Router();

router.post("/", createShortUrl);
router.get("/", getAllUrls);
router.get("/code/:shortCode", getUrlByShortCode);
router.patch("/:id", updateUrl);
router.delete("/:id", deleteUrl);
router.get("/analytics/:shortCode", getUrlAnalytics);
router.get("/r/:shortCode", redirectToOriginalUrl);

export default router;
