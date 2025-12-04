// src/routes/quiz.routes.ts
import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { 
  getAllQuizzes, 
  getQuizById, 
  startQuiz, 
  submitQuiz 
} from '../controllers/quiz.controller';
import { validate } from '../middleware/validation.middleware';
import { startQuizSchema, submitQuizSchema } from '../validators/quiz.validator';

const router = Router();

router.get('/', getAllQuizzes);
router.get('/:id', getQuizById);

// Authenticated routes
router.post('/:id/start', authenticate, validate(startQuizSchema), startQuiz);
router.post('/:id/submit', authenticate, validate(submitQuizSchema), submitQuiz);

export { router as quizRoutes };