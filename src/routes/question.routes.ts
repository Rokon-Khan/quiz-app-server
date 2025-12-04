// src/routes/question.routes.ts
import { Router } from 'express';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware';
import { 
  getAllQuestions, 
  getQuestionById, 
  createQuestion, 
  updateQuestion, 
  deleteQuestion 
} from '../controllers/question.controller';
import { validate } from '../middleware/validation.middleware';
import { 
  createQuestionSchema, 
  updateQuestionSchema 
} from '../validators/question.validator';

const router = Router();

// Admin routes
router.get('/', authenticate, authorizeAdmin, getAllQuestions);
router.get('/:id', authenticate, authorizeAdmin, getQuestionById);
router.post('/', authenticate, authorizeAdmin, validate(createQuestionSchema), createQuestion);
router.put('/:id', authenticate, authorizeAdmin, validate(updateQuestionSchema), updateQuestion);
router.delete('/:id', authenticate, authorizeAdmin, deleteQuestion);

export { router as questionRoutes };