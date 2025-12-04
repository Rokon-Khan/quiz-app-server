// src/controllers/question.controller.ts
import { Request, Response } from "express";
import { prisma } from "../config/database";
import { fileUploader } from "../utils/fileUploader";
import { logger } from "../utils/logger";

export const getAllQuestions = async (req: Request, res: Response) => {
  try {
    const { quizId, type } = req.query;

    const whereClause: any = {};

    if (quizId) {
      whereClause.quiz_id = quizId as string;
    }

    if (type) {
      whereClause.question_type = type as string;
    }

    const questions = await prisma.question.findMany({
      where: whereClause,
      include: {
        options: {
          orderBy: {
            display_order: "asc",
          },
        },
        quiz: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        display_order: "asc",
      },
    });

    res.status(200).json({
      success: true,
      message: "Questions retrieved successfully",
      data: questions,
    });
  } catch (error) {
    logger.error("Error fetching questions:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getQuestionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        options: {
          orderBy: {
            display_order: "asc",
          },
        },
        quiz: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Question retrieved successfully",
      data: question,
    });
  } catch (error) {
    logger.error("Error fetching question:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const createQuestion = async (req: Request, res: Response) => {
  try {
    const {
      quiz_id,
      question_type,
      question_text,
      points = 1,
      display_order = 0,
      options,
      metadata = {},
    } = req.body;
    const file = req.file;

    let question_image_url = req.body.question_image_url;
    if (file) {
      const uploadResult = (await fileUploader.uploadToCloudinary(file)) as any;
      question_image_url = uploadResult.secure_url;
    }

    // Create the question
    const question = await prisma.question.create({
      data: {
        quiz_id,
        question_type,
        question_text,
        points: parseInt(points),
        display_order: parseInt(display_order),
        question_image_url,
        metadata:
          typeof metadata === "string" ? JSON.parse(metadata) : metadata,
      },
    });

    // Create the answer options
    if (options && options.length > 0) {
      for (const option of options) {
        const optionData: {
          question_id: string;
          option_text: string | null;
          is_correct: boolean;
          display_order: number;
        } = {
          question_id: question.id,
          option_text:
            typeof option.option_text === "string" ? option.option_text : null,
          is_correct: Boolean(option.is_correct),
          display_order: Number(option.display_order) || 0,
        };

        await prisma.answerOption.create({
          data: optionData,
        });
      }
    }

    // Fetch the created question with options
    const createdQuestion = await prisma.question.findUnique({
      where: { id: question.id },
      include: {
        options: {
          orderBy: {
            display_order: "asc",
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Question created successfully",
      data: createdQuestion,
    });
  } catch (error) {
    logger.error("Error creating question:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Question ID is required",
      });
    }

    const {
      question_type,
      question_text,
      points,
      display_order,
      metadata,
      options,
    } = req.body;
    const file = req.file;

    const currentQuestion = await prisma.question.findUnique({ where: { id } });
    if (!currentQuestion) {
      return res
        .status(404)
        .json({ success: false, message: "Question not found" });
    }

    let question_image_url =
      req.body.question_image_url || currentQuestion.question_image_url;
    if (file) {
      const uploadResult = (await fileUploader.uploadToCloudinary(
        file,
        currentQuestion.question_image_url || undefined
      )) as any;
      question_image_url = uploadResult.secure_url;
    }

    // Update the question
    const updatedQuestion = await prisma.question.update({
      where: { id },
      data: {
        ...(question_type && { question_type }),
        ...(question_text && { question_text }),
        ...(points && { points: parseInt(points) }),
        ...(display_order && { display_order: parseInt(display_order) }),
        ...(question_image_url && { question_image_url }),
        ...(metadata && {
          metadata:
            typeof metadata === "string" ? JSON.parse(metadata) : metadata,
        }),
        updated_at: new Date(),
      },
    });

    // If options are provided, update them
    if (options && Array.isArray(options)) {
      // First, delete existing options
      await prisma.answerOption.deleteMany({
        where: { question_id: id },
      });

      // Then create new options
      for (const option of options) {
        const optionData: {
          question_id: string;
          option_text: string | null;
          is_correct: boolean;
          display_order: number;
        } = {
          question_id: id as string, // Ensure id is treated as string
          option_text:
            typeof option.option_text === "string" ? option.option_text : null,
          is_correct: Boolean(option.is_correct),
          display_order: Number(option.display_order) || 0,
        };

        await prisma.answerOption.create({
          data: optionData,
        });
      }
    }

    // Fetch the updated question with options
    const questionWithDetails = await prisma.question.findUnique({
      where: { id },
      include: {
        options: {
          orderBy: {
            display_order: "asc",
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Question updated successfully",
      data: questionWithDetails,
    });
  } catch (error) {
    logger.error("Error updating question:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if question exists
    const question = await prisma.question.findUnique({
      where: { id },
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    // Delete the question (and its associated options due to cascade)
    await prisma.question.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting question:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
