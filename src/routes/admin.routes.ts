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
  getAllFunFacts,
  getFunFactById,
  createFunFact,
  updateFunFact,
  deleteFunFact,
  getAllCertificates,
  getCertificateById,
  createCertificate,
  updateCertificate,
  deleteCertificate,
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
  fileUploader.upload.single("thumbnail"),
  createQuiz
);
router.put(
  "/quizzes/:id",
  authenticate,
  authorizeAdmin,
  fileUploader.upload.single("thumbnail"),
  updateQuiz
);
router.delete("/quizzes/:id", authenticate, authorizeAdmin, deleteQuiz);

// Fun Facts routes
router.get("/funfacts", authenticate, authorizeAdmin, getAllFunFacts);
router.get("/funfacts/:id", authenticate, authorizeAdmin, getFunFactById);
router.post(
  "/funfacts",
  authenticate,
  authorizeAdmin,
  fileUploader.upload.single("image"),
  createFunFact
);
router.put(
  "/funfacts/:id",
  authenticate,
  authorizeAdmin,
  fileUploader.upload.single("image"),
  updateFunFact
);
router.delete("/funfacts/:id", authenticate, authorizeAdmin, deleteFunFact);

// Certificate routes
router.get("/certificates", authenticate, authorizeAdmin, getAllCertificates);
router.get("/certificates/:id", authenticate, authorizeAdmin, getCertificateById);
router.post(
  "/certificates",
  authenticate,
  authorizeAdmin,
  fileUploader.upload.single("certificate"),
  createCertificate
);
router.put(
  "/certificates/:id",
  authenticate,
  authorizeAdmin,
  fileUploader.upload.single("certificate"),
  updateCertificate
);
router.delete("/certificates/:id", authenticate, authorizeAdmin, deleteCertificate);

// Analytics routes
router.get("/analytics", authenticate, authorizeAdmin, getAnalytics);

// User management routes
router.get("/users", authenticate, authorizeAdmin, getAllUsers);
router.get("/users/:id", authenticate, authorizeAdmin, getUserById);



export { router as adminRoutes };
