import { Router } from "express";
import {
	deleteUserAccount,
	getCurrentUser,
	loginUser,
	logoutUser,
	registerUser,
	updateUserProfile,
} from "../controllers/user.controller.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/me", getCurrentUser);
router.patch("/me", updateUserProfile);
router.delete("/me", deleteUserAccount);

export default router;
