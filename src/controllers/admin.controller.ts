// src/controllers/admin.controller.ts
import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

// Category Management
export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        display_order: 'asc',
      },
    });

    res.status(200).json({
      success: true,
      message: 'Categories retrieved successfully',
      data: categories,
    });
  } catch (error) {
    logger.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
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
        message: 'Category not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Category retrieved successfully',
      data: category,
    });
  } catch (error) {
    logger.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
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
      message: 'Category created successfully',
      data: category,
    });
  } catch (error) {
    logger.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
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
      message: 'Category updated successfully',
      data: category,
    });
  } catch (error) {
    logger.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
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
        message: 'Cannot delete category with associated quizzes',
      });
    }

    await prisma.category.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
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
        created_at: 'desc',
      },
    });

    res.status(200).json({
      success: true,
      message: 'Quizzes retrieved successfully',
      data: quizzes,
    });
  } catch (error) {
    logger.error('Error fetching quizzes:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
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
            display_order: 'asc',
          },
        },
      },
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Quiz retrieved successfully',
      data: quiz,
    });
  } catch (error) {
    logger.error('Error fetching quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const createQuiz = async (req: Request, res: Response) => {
  try {
    const { 
      category_id, 
      title, 
      description, 
      thumbnail_url, 
      difficulty_level, 
      questions_per_attempt, 
      time_limit_minutes, 
      passing_score, 
      is_published 
    } = req.body;

    const quiz = await prisma.quiz.create({
      data: {
        category_id,
        title,
        description,
        thumbnail_url,
        difficulty_level,
        questions_per_attempt,
        time_limit_minutes,
        passing_score,
        is_published,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: quiz,
    });
  } catch (error) {
    logger.error('Error creating quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
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
      thumbnail_url, 
      difficulty_level, 
      questions_per_attempt, 
      time_limit_minutes, 
      passing_score, 
      is_published 
    } = req.body;

    const quiz = await prisma.quiz.update({
      where: { id },
      data: {
        category_id,
        title,
        description,
        thumbnail_url,
        difficulty_level,
        questions_per_attempt,
        time_limit_minutes,
        passing_score,
        is_published,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Quiz updated successfully',
      data: quiz,
    });
  } catch (error) {
    logger.error('Error updating quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
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
      message: 'Quiz deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
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
      where: { status: 'completed' },
    });

    // Get recent activity
    const recentUsers = await prisma.user.findMany({
      orderBy: { created_at: 'desc' },
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
      orderBy: { started_at: 'desc' },
      take: 5,
    });

    res.status(200).json({
      success: true,
      message: 'Analytics retrieved successfully',
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
    logger.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
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
        created_at: 'desc',
      },
    });

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: users,
    });
  } catch (error) {
    logger.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
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
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: user,
    });
  } catch (error) {
    logger.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};