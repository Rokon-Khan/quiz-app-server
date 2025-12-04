// src/routes/admin.routes.ts
import { Router } from "express";
import {
  createCategory,
  createQuiz,
  deleteCategory,
  deleteQuiz,
  getAllCategories,
  getAllQuizzesAdmin,
  getAllUsers,
  getAnalytics,
  getCategoryById,
  getQuizByIdAdmin,
  getUserById,
  updateCategory,
  updateQuiz,
} from "../controllers/admin.controller";
import { authenticate, authorizeAdmin } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
// import { fileUploader } from "./utils/fileUploader";
import { fileUploader } from "../utils/fileUploader";
import {
  createCategorySchema,
  createQuizSchema,
  updateCategorySchema,
  updateQuizSchema,
} from "../validators/admin.validator";
// import { fileUploader } from '../utils/fileUploader';

const router = Router();

// Category routes
router.get("/categories", authenticate, authorizeAdmin, getAllCategories);
router.get("/categories/:id", authenticate, authorizeAdmin, getCategoryById);
router.post(
  "/categories",
  authenticate,
  authorizeAdmin,
  validate(createCategorySchema),
  createCategory
);
router.put(
  "/categories/:id",
  authenticate,
  authorizeAdmin,
  validate(updateCategorySchema),
  updateCategory
);
router.delete("/categories/:id", authenticate, authorizeAdmin, deleteCategory);

// Quiz routes
router.get("/quizzes", authenticate, authorizeAdmin, getAllQuizzesAdmin);
router.get("/quizzes/:id", authenticate, authorizeAdmin, getQuizByIdAdmin);
router.post(
  "/quizzes",
  authenticate,
  authorizeAdmin,
  validate(createQuizSchema),
  createQuiz
);
router.put(
  "/quizzes/:id",
  authenticate,
  authorizeAdmin,
  validate(updateQuizSchema),
  updateQuiz
);
router.delete("/quizzes/:id", authenticate, authorizeAdmin, deleteQuiz);

// Question routes (delegated to question controller)
// Analytics routes
router.get("/analytics", authenticate, authorizeAdmin, getAnalytics);

// User management routes
router.get("/users", authenticate, authorizeAdmin, getAllUsers);
router.get("/users/:id", authenticate, authorizeAdmin, getUserById);

// File upload routes
router.post(
  "/upload/quiz-thumbnail",
  authenticate,
  authorizeAdmin,
  fileUploader.upload.single("thumbnail"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "No file uploaded" });
      }
      const uploadResult = (await fileUploader.uploadToCloudinary(
        req.file
      )) as any;
      res.status(200).json({
        success: true,
        message: "Quiz thumbnail uploaded successfully",
        data: { url: uploadResult.secure_url },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "File upload failed" });
    }
  }
);

router.post(
  "/upload/question-image",
  authenticate,
  authorizeAdmin,
  fileUploader.upload.single("question_image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "No file uploaded" });
      }
      const uploadResult = (await fileUploader.uploadToCloudinary(
        req.file
      )) as any;
      res.status(200).json({
        success: true,
        message: "Question image uploaded successfully",
        data: { url: uploadResult.secure_url },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "File upload failed" });
    }
  }
);

router.post(
  "/upload/option-image",
  authenticate,
  authorizeAdmin,
  fileUploader.upload.single("option_image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "No file uploaded" });
      }
      const uploadResult = (await fileUploader.uploadToCloudinary(
        req.file
      )) as any;
      res.status(200).json({
        success: true,
        message: "Option image uploaded successfully",
        data: { url: uploadResult.secure_url },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "File upload failed" });
    }
  }
);

router.post(
  "/upload/funfact-image",
  authenticate,
  authorizeAdmin,
  fileUploader.upload.single("funfact_image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "No file uploaded" });
      }
      const uploadResult = (await fileUploader.uploadToCloudinary(
        req.file
      )) as any;
      res.status(200).json({
        success: true,
        message: "Fun fact image uploaded successfully",
        data: { url: uploadResult.secure_url },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "File upload failed" });
    }
  }
);

router.post(
  "/upload/certificate",
  authenticate,
  authorizeAdmin,
  fileUploader.upload.single("certificate"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "No file uploaded" });
      }
      const uploadResult = (await fileUploader.uploadToCloudinary(
        req.file
      )) as any;
      res.status(200).json({
        success: true,
        message: "Certificate uploaded successfully",
        data: { url: uploadResult.secure_url },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "File upload failed" });
    }
  }
);

export { router as adminRoutes };
