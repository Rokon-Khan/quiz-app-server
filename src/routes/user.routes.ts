// src/routes/user.routes.ts
import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { 
  getUserProgress,
  getUserAttempts,
  getUserCertificates
} from '../controllers/user.controller';

const router = Router();

// Authenticated user routes
router.get('/me/progress', authenticate, getUserProgress);
router.get('/me/attempts', authenticate, getUserAttempts);
router.get('/me/certificates', authenticate, getUserCertificates);

export { router as userRoutes };