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
import { validateRequest } from "../middlewares/validation.middleware.js";
import {
  loginUserSchema,
  registerUserSchema,
  refreshTokenSchema,
} from "../validations/index.js";

const router = Router();

router.post(
  "/register",
  validateRequest({ body: registerUserSchema }),
  registerUser,
);
router.post("/login", validateRequest({ body: loginUserSchema }), loginUser);
router.post(
  "/access-token",
  validateRequest({ body: refreshTokenSchema }),
  getNewAccessToken,
);
router.post("/logout", verifyJWT, logoutUser);
router.get("/me", verifyJWT, getCurrentUser);
router.delete("/me", verifyJWT, deleteUserAccount);

export default router;
