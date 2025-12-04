// src/routes/admin.routes.ts
import { Router } from 'express';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware';
import { 
  getAllCategories, 
  getCategoryById, 
  createCategory, 
  updateCategory, 
  deleteCategory,
  getAllQuizzesAdmin,
  getQuizByIdAdmin,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getAnalytics,
  getAllUsers,
  getUserById
} from '../controllers/admin.controller';
import { validate } from '../middleware/validation.middleware';
import { 
  createCategorySchema, 
  updateCategorySchema,
  createQuizSchema,
  updateQuizSchema
} from '../validators/admin.validator';
import { uploadSingleImage } from '../middleware/upload.middleware';

const router = Router();

// Category routes
router.get('/categories', authenticate, authorizeAdmin, getAllCategories);
router.get('/categories/:id', authenticate, authorizeAdmin, getCategoryById);
router.post('/categories', authenticate, authorizeAdmin, validate(createCategorySchema), createCategory);
router.put('/categories/:id', authenticate, authorizeAdmin, validate(updateCategorySchema), updateCategory);
router.delete('/categories/:id', authenticate, authorizeAdmin, deleteCategory);

// Quiz routes
router.get('/quizzes', authenticate, authorizeAdmin, getAllQuizzesAdmin);
router.get('/quizzes/:id', authenticate, authorizeAdmin, getQuizByIdAdmin);
router.post('/quizzes', authenticate, authorizeAdmin, validate(createQuizSchema), createQuiz);
router.put('/quizzes/:id', authenticate, authorizeAdmin, validate(updateQuizSchema), updateQuiz);
router.delete('/quizzes/:id', authenticate, authorizeAdmin, deleteQuiz);

// Question routes (delegated to question controller)
// Analytics routes
router.get('/analytics', authenticate, authorizeAdmin, getAnalytics);

// User management routes
router.get('/users', authenticate, authorizeAdmin, getAllUsers);
router.get('/users/:id', authenticate, authorizeAdmin, getUserById);

// File upload route
router.post('/upload/image', authenticate, authorizeAdmin, uploadSingleImage('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }
  
  res.status(200).json({
    success: true,
    message: 'File uploaded successfully',
    data: {
      url: `/uploads/${req.file.filename}`,
      filename: req.file.filename
    }
  });
});

export { router as adminRoutes };