// src/controllers/user.controller.ts
import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

export const getUserProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const progress = await prisma.userProgress.findMany({
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

    res.status(200).json({
      success: true,
      message: 'User progress retrieved successfully',
      data: progress,
    });
  } catch (error) {
    logger.error('Error fetching user progress:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const getUserAttempts = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const attempts = await prisma.userQuizAttempt.findMany({
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

    res.status(200).json({
      success: true,
      message: 'User attempts retrieved successfully',
      data: attempts,
    });
  } catch (error) {
    logger.error('Error fetching user attempts:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const getUserCertificates = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const certificates = await prisma.certificate.findMany({
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

    res.status(200).json({
      success: true,
      message: 'User certificates retrieved successfully',
      data: certificates,
    });
  } catch (error) {
    logger.error('Error fetching user certificates:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};