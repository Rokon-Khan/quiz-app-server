// src/services/user.service.ts
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

export class UserService {
  /**
   * Get user progress
   */
  static async getUserProgress(userId: string) {
    try {
      return await prisma.userProgress.findMany({
        where: { user_id: userId },
        include: {
          quiz: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          last_attempt_at: 'desc',
        },
      });
    } catch (error) {
      logger.error('Error in getUserProgress service:', error);
      throw error;
    }
  }

  /**
   * Get user quiz attempts
   */
  static async getUserAttempts(userId: string) {
    try {
      return await prisma.userQuizAttempt.findMany({
        where: { user_id: userId },
        include: {
          quiz: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          started_at: 'desc',
        },
      });
    } catch (error) {
      logger.error('Error in getUserAttempts service:', error);
      throw error;
    }
  }

  /**
   * Get user certificates
   */
  static async getUserCertificates(userId: string) {
    try {
      return await prisma.certificate.findMany({
        where: { user_id: userId },
        include: {
          quiz: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          issued_at: 'desc',
        },
      });
    } catch (error) {
      logger.error('Error in getUserCertificates service:', error);
      throw error;
    }
  }
}