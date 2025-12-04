// src/services/certificate.service.ts
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

export class CertificateService {
  /**
   * Generate certificate for a user who passed a quiz
   */
  static async generateCertificate(userId: string, quizId: string, score: number) {
    try {
      // Check if user has already received a certificate for this quiz
      const existingCertificate = await prisma.certificate.findUnique({
        where: {
          user_id_quiz_id: {
            user_id: userId,
            quiz_id: quizId,
          },
        },
      });

      if (existingCertificate) {
        // If certificate exists, return it instead of creating a new one
        return existingCertificate;
      }

      // Generate certificate URL (in a real app, this would generate a PDF/CSS-based certificate)
      const certificateUrl = `https://api.yourdomain.com/certificates/${userId}/${quizId}?score=${score}&ts=${Date.now()}`;

      // Create certificate record
      const certificate = await prisma.certificate.create({
        data: {
          user_id: userId,
          quiz_id: quizId,
          certificate_url: certificateUrl,
          score_achieved: score,
        },
      });

      return certificate;
    } catch (error) {
      logger.error('Error generating certificate:', error);
      throw error;
    }
  }

  /**
   * Get certificate by user and quiz IDs
   */
  static async getCertificate(userId: string, quizId: string) {
    try {
      return await prisma.certificate.findUnique({
        where: {
          user_id_quiz_id: {
            user_id: userId,
            quiz_id: quizId,
          },
        },
        include: {
          user: {
            select: {
              full_name: true,
              email: true,
            },
          },
          quiz: {
            select: {
              title: true,
              description: true,
            },
          },
        },
      });
    } catch (error) {
      logger.error('Error fetching certificate:', error);
      throw error;
    }
  }

  /**
   * Get all certificates for a user
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
      logger.error('Error fetching user certificates:', error);
      throw error;
    }
  }
}