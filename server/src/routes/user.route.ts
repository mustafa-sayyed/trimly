import { Router } from "express";
import {
  deleteUserAccount,
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  getNewAccessToken,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/access-token", getNewAccessToken);
router.post("/logout", verifyJWT, logoutUser);
router.get("/me", verifyJWT, getCurrentUser);
router.delete("/me", verifyJWT, deleteUserAccount);

export default router;
