// src/routes/question.routes.ts
import { Router } from "express";
import {
  createQuestion,
  deleteQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
} from "../controllers/question.controller";
import { authenticate, authorizeAdmin } from "../middleware/auth.middleware";
import { fileUploader } from "../utils/fileUploader";

const router = Router();

// Admin routes
router.get("/", authenticate, authorizeAdmin, getAllQuestions);
router.get("/:id", authenticate, authorizeAdmin, getQuestionById);
router.post(
  "/",
  authenticate,
  authorizeAdmin,
  fileUploader.upload.single("question_image"),
  // validate(createQuestionSchema),
  createQuestion
);
router.put(
  "/:id",
  authenticate,
  authorizeAdmin,
  fileUploader.upload.single("question_image"),
  // validate(updateQuestionSchema),
  updateQuestion
);
router.delete("/:id", authenticate, authorizeAdmin, deleteQuestion);

export { router as questionRoutes };
