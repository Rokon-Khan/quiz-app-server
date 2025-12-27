// src/services/user.service.ts
import { prisma } from "../config/database";
import { logger } from "../utils/logger";

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
          last_attempt_at: "desc",
        },
      });
    } catch (error) {
      logger.error("Error in getUserProgress service:", error);
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
          started_at: "desc",
        },
      });
    } catch (error) {
      logger.error("Error in getUserAttempts service:", error);
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
          issued_at: "desc",
        },
      });
    } catch (error) {
      logger.error("Error in getUserCertificates service:", error);
      throw error;
    }
  }

  /**
   * Toggle user active status (activate/deactivate)
   */
  static async toggleUserActiveStatus(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { is_active: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          is_active: !user.is_active,
          updated_at: new Date(),
        },
      });

      return !user.is_active; // Return new status
    } catch (error) {
      logger.error("Error toggling user status in service:", error);
      throw error;
    }
  }

  /**
   * delete single user from database
   */
  static async deleteUserById(userId: string) {
    try {
      await prisma.user.delete({
        where: { id: userId },
      });
    } catch (error) {
      logger.error("Error deleting user by ID in service:", error);
      throw error;
    }
  }
}
