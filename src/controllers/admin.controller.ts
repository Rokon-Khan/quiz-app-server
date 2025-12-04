// src/controllers/admin.controller.ts
import { Request, Response } from "express";
import { prisma } from "../config/database";
import { fileUploader } from "../utils/fileUploader";
import { logger } from "../utils/logger";

// Category Management
export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        display_order: "asc",
      },
    });

    res.status(200).json({
      success: true,
      message: "Categories retrieved successfully",
      data: categories,
    });
  } catch (error) {
    logger.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category retrieved successfully",
      data: category,
    });
  } catch (error) {
    logger.error("Error fetching category:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, icon_url, display_order, is_active } = req.body;

    const category = await prisma.category.create({
      data: {
        name,
        description,
        icon_url,
        display_order,
        is_active,
      },
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    logger.error("Error creating category:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, icon_url, display_order, is_active } = req.body;

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        description,
        icon_url,
        display_order,
        is_active,
      },
    });

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    logger.error("Error updating category:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if category has associated quizzes
    const quizCount = await prisma.quiz.count({
      where: { category_id: id },
    });

    if (quizCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete category with associated quizzes",
      });
    }

    await prisma.category.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting category:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Quiz Management
export const getAllQuizzesAdmin = async (req: Request, res: Response) => {
  try {
    const quizzes = await prisma.quiz.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    res.status(200).json({
      success: true,
      message: "Quizzes retrieved successfully",
      data: quizzes,
    });
  } catch (error) {
    logger.error("Error fetching quizzes:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getQuizByIdAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        questions: {
          include: {
            options: true,
          },
          orderBy: {
            display_order: "asc",
          },
        },
      },
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Quiz retrieved successfully",
      data: quiz,
    });
  } catch (error) {
    logger.error("Error fetching quiz:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const createQuiz = async (req: Request, res: Response) => {
  try {
    const {
      category_id,
      title,
      description,
      difficulty_level = "medium",
      questions_per_attempt = 10,
      time_limit_minutes = 0,
      passing_score = 70,
      is_published = false,
    } = req.body;
    const file = req.file;

    const category = await prisma.category.findUnique({
      where: { id: category_id },
    });

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category not found",
      });
    }

    let thumbnail_url = req.body.thumbnail_url;
    if (file) {
      const uploadResult = (await fileUploader.uploadToCloudinary(file)) as any;
      thumbnail_url = uploadResult.secure_url;
    }

    const quiz = await prisma.quiz.create({
      data: {
        category_id,
        title,
        description,
        thumbnail_url,
        difficulty_level,
        questions_per_attempt: parseInt(questions_per_attempt),
        time_limit_minutes: parseInt(time_limit_minutes),
        passing_score: parseInt(passing_score),
        is_published: is_published === "true" || is_published === true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Quiz created successfully",
      data: quiz,
    });
  } catch (error) {
    logger.error("Error creating quiz:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateQuiz = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      category_id,
      title,
      description,
      difficulty_level,
      questions_per_attempt,
      time_limit_minutes,
      passing_score,
      is_published,
    } = req.body;
    const file = req.file;

    const currentQuiz = await prisma.quiz.findUnique({ where: { id } });
    if (!currentQuiz) {
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found" });
    }

    let thumbnail_url = req.body.thumbnail_url || currentQuiz.thumbnail_url;
    if (file) {
      const uploadResult = (await fileUploader.uploadToCloudinary(
        file,
        currentQuiz.thumbnail_url || undefined
      )) as any;
      thumbnail_url = uploadResult.secure_url;
    }

    const quiz = await prisma.quiz.update({
      where: { id },
      data: {
        ...(category_id && { category_id }),
        ...(title && { title }),
        ...(description && { description }),
        ...(thumbnail_url && { thumbnail_url }),
        ...(difficulty_level && { difficulty_level }),
        ...(questions_per_attempt && {
          questions_per_attempt: parseInt(questions_per_attempt),
        }),
        ...(time_limit_minutes && {
          time_limit_minutes: parseInt(time_limit_minutes),
        }),
        ...(passing_score && { passing_score: parseInt(passing_score) }),
        ...(is_published !== undefined && {
          is_published: is_published === "true" || is_published === true,
        }),
        updated_at: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      message: "Quiz updated successfully",
      data: quiz,
    });
  } catch (error) {
    logger.error("Error updating quiz:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteQuiz = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.quiz.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting quiz:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Analytics
export const getAnalytics = async (req: Request, res: Response) => {
  try {
    // Get basic analytics
    const totalUsers = await prisma.user.count();
    const totalQuizzes = await prisma.quiz.count();
    const totalQuestions = await prisma.question.count();
    const completedAttempts = await prisma.userQuizAttempt.count({
      where: { status: "completed" },
    });

    // Get recent activity
    const recentUsers = await prisma.user.findMany({
      orderBy: { created_at: "desc" },
      take: 5,
    });

    const recentAttempts = await prisma.userQuizAttempt.findMany({
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
          },
        },
      },
      orderBy: { started_at: "desc" },
      take: 5,
    });

    res.status(200).json({
      success: true,
      message: "Analytics retrieved successfully",
      data: {
        summary: {
          totalUsers,
          totalQuizzes,
          totalQuestions,
          completedAttempts,
        },
        recentActivity: {
          recentUsers,
          recentAttempts,
        },
      },
    });
  } catch (error) {
    logger.error("Error fetching analytics:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// User Management
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (error) {
    logger.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
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
      message: "User retrieved successfully",
      data: user,
    });
  } catch (error) {
    logger.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Fun Facts Management
export const getAllFunFacts = async (req: Request, res: Response) => {
  try {
    const funFacts = await prisma.funFact.findMany({
      include: { question: { select: { id: true, question_text: true } } },
      orderBy: { created_at: "desc" },
    });
    res
      .status(200)
      .json({
        success: true,
        message: "Fun facts retrieved successfully",
        data: funFacts,
      });
  } catch (error) {
    logger.error("Error fetching fun facts:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getFunFactById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const funFact = await prisma.funFact.findUnique({
      where: { id },
      include: { question: { select: { id: true, question_text: true } } },
    });
    if (!funFact) {
      return res
        .status(404)
        .json({ success: false, message: "Fun fact not found" });
    }
    res
      .status(200)
      .json({
        success: true,
        message: "Fun fact retrieved successfully",
        data: funFact,
      });
  } catch (error) {
    logger.error("Error fetching fun fact:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const createFunFact = async (req: Request, res: Response) => {
  try {
    const { question_id, title, content } = req.body;
    const file = req.file;

    let image_url = req.body.image_url;
    if (file) {
      const uploadResult = (await fileUploader.uploadToCloudinary(file)) as any;
      image_url = uploadResult.secure_url;
    }

    const funFact = await prisma.funFact.create({
      data: { question_id, title, content, image_url },
    });

    res
      .status(201)
      .json({
        success: true,
        message: "Fun fact created successfully",
        data: funFact,
      });
  } catch (error) {
    logger.error("Error creating fun fact:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateFunFact = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const file = req.file;

    const currentFunFact = await prisma.funFact.findUnique({ where: { id } });
    if (!currentFunFact) {
      return res
        .status(404)
        .json({ success: false, message: "Fun fact not found" });
    }

    let image_url = req.body.image_url || currentFunFact.image_url;
    if (file) {
      const uploadResult = (await fileUploader.uploadToCloudinary(
        file,
        currentFunFact.image_url || undefined
      )) as any;
      image_url = uploadResult.secure_url;
    }

    const funFact = await prisma.funFact.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(image_url && { image_url }),
      },
    });

    res
      .status(200)
      .json({
        success: true,
        message: "Fun fact updated successfully",
        data: funFact,
      });
  } catch (error) {
    logger.error("Error updating fun fact:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const deleteFunFact = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.funFact.delete({ where: { id } });
    res
      .status(200)
      .json({ success: true, message: "Fun fact deleted successfully" });
  } catch (error) {
    logger.error("Error deleting fun fact:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Certificate Management
export const getAllCertificates = async (req: Request, res: Response) => {
  try {
    const certificates = await prisma.certificate.findMany({
      include: {
        user: { select: { id: true, full_name: true, email: true } },
        quiz: { select: { id: true, title: true } },
      },
      orderBy: { issued_at: "desc" },
    });
    res
      .status(200)
      .json({
        success: true,
        message: "Certificates retrieved successfully",
        data: certificates,
      });
  } catch (error) {
    logger.error("Error fetching certificates:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getCertificateById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const certificate = await prisma.certificate.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, full_name: true, email: true } },
        quiz: { select: { id: true, title: true } },
      },
    });
    if (!certificate) {
      return res
        .status(404)
        .json({ success: false, message: "Certificate not found" });
    }
    res
      .status(200)
      .json({
        success: true,
        message: "Certificate retrieved successfully",
        data: certificate,
      });
  } catch (error) {
    logger.error("Error fetching certificate:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const createCertificate = async (req: Request, res: Response) => {
  try {
    const { user_id, quiz_id, score_achieved } = req.body;
    const file = req.file;

    let certificate_url = req.body.certificate_url;
    if (file) {
      const uploadResult = (await fileUploader.uploadToCloudinary(file)) as any;
      certificate_url = uploadResult.secure_url;
    }

    const certificate = await prisma.certificate.create({
      data: {
        user_id,
        quiz_id,
        certificate_url,
        score_achieved: parseInt(score_achieved),
      },
    });

    res
      .status(201)
      .json({
        success: true,
        message: "Certificate created successfully",
        data: certificate,
      });
  } catch (error) {
    logger.error("Error creating certificate:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateCertificate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { score_achieved } = req.body;
    const file = req.file;

    const currentCertificate = await prisma.certificate.findUnique({
      where: { id },
    });
    if (!currentCertificate) {
      return res
        .status(404)
        .json({ success: false, message: "Certificate not found" });
    }

    let certificate_url =
      req.body.certificate_url || currentCertificate.certificate_url;
    if (file) {
      const uploadResult = (await fileUploader.uploadToCloudinary(
        file,
        currentCertificate.certificate_url || undefined
      )) as any;
      certificate_url = uploadResult.secure_url;
    }

    const certificate = await prisma.certificate.update({
      where: { id },
      data: {
        ...(certificate_url && { certificate_url }),
        ...(score_achieved && { score_achieved: parseInt(score_achieved) }),
      },
    });

    res
      .status(200)
      .json({
        success: true,
        message: "Certificate updated successfully",
        data: certificate,
      });
  } catch (error) {
    logger.error("Error updating certificate:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const deleteCertificate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.certificate.delete({ where: { id } });
    res
      .status(200)
      .json({ success: true, message: "Certificate deleted successfully" });
  } catch (error) {
    logger.error("Error deleting certificate:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
