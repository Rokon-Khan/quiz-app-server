// src/routes/auth.routes.ts
import { Router } from "express";
import {
  changePassword,
  forgotPassword,
  getMe,
  login,
  logout,
  refreshToken,
  register,
  resetPassword,
} from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
} from "../validators/auth.validator";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/change-password", authenticate, changePassword);
router.post("/reset-password", authenticate, resetPassword);
router.get("/me", authenticate, getMe);

export { router as authRoutes };
