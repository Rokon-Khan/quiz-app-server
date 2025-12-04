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
import { validate } from "../middleware/validation.middleware";
import { fileUploader } from "../utils/fileUploader";
import {
  createQuestionSchema,
  updateQuestionSchema,
} from "../validators/question.validator";

const router = Router();

// Admin routes
router.get("/", authenticate, authorizeAdmin, getAllQuestions);
router.get("/:id", authenticate, authorizeAdmin, getQuestionById);
router.post(
  "/",
  authenticate,
  authorizeAdmin,
  validate(createQuestionSchema),
  fileUploader.upload.single("question_image"),
  createQuestion
);
router.put(
  "/:id",
  authenticate,
  authorizeAdmin,
  validate(updateQuestionSchema),
  fileUploader.upload.single("question_image"),
  updateQuestion
);
router.delete("/:id", authenticate, authorizeAdmin, deleteQuestion);

export { router as questionRoutes };
