// src/controllers/user.controller.ts
import { Request, Response } from "express";
import { prisma } from "../config/database";
import { fileUploader } from "../utils/fileUploader";
import { logger } from "../utils/logger";

export const getUserProfile = async (
  req: Request & { user?: any },
  res: Response
) => {
  try {
    const userId = req.user?.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        full_name: true,
        avatar_url: true,
        role: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User profile retrieved successfully",
      data: user,
    });
  } catch (error) {
    logger.error("Get user profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateUserProfile = async (
  req: Request & { user?: any },
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const { full_name } = req.body;
    const file = req.file;

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let avatar_url = currentUser.avatar_url;

    if (file) {
      const uploadResult = (await fileUploader.uploadToCloudinary(
        file,
        currentUser.avatar_url || undefined
      )) as any;
      avatar_url = uploadResult.secure_url;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(full_name && { full_name }),
        ...(avatar_url && { avatar_url }),
        updated_at: new Date(),
      },
      select: {
        id: true,
        email: true,
        full_name: true,
        avatar_url: true,
        role: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    logger.error("Update user profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getUserProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
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
        last_attempt_at: "desc",
      },
    });

    res.status(200).json({
      success: true,
      message: "User progress retrieved successfully",
      data: progress,
    });
  } catch (error) {
    logger.error("Error fetching user progress:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getUserAttempts = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
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
        started_at: "desc",
      },
    });

    res.status(200).json({
      success: true,
      message: "User attempts retrieved successfully",
      data: attempts,
    });
  } catch (error) {
    logger.error("Error fetching user attempts:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getUserCertificates = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
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
        issued_at: "desc",
      },
    });

    res.status(200).json({
      success: true,
      message: "User certificates retrieved successfully",
      data: certificates,
    });
  } catch (error) {
    logger.error("Error fetching user certificates:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
