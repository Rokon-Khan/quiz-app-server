// src/routes/user.routes.ts
import { Router } from "express";
// import { fileUploader } from "../../utils/fileUploader";
import {
  getUserAttempts,
  getUserCertificates,
  getUserProfile,
  getUserProgress,
  updateUserProfile,
} from "../controllers/user.controller";
import { authenticate } from "../middleware/auth.middleware";
import { fileUploader } from "../utils/fileUploader";

const router = Router();

// Authenticated user routes
router.get("/me", authenticate, getUserProfile);
router.put(
  "/me",
  authenticate,
  fileUploader.upload.single("avatar_url"),
  updateUserProfile
);
router.get("/me/progress", authenticate, getUserProgress);
router.get("/me/attempts", authenticate, getUserAttempts);
router.get("/me/certificates", authenticate, getUserCertificates);

export { router as userRoutes };
