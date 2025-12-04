// src/controllers/quiz.controller.ts
import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import { calculateScorePercentage, isQuizPassed } from '../utils/helpers';

export const getAllQuizzes = async (req: Request, res: Response) => {
  try {
    const { category, difficulty, published = 'true' } = req.query;

    const whereClause: any = {
      is_published: published === 'true',
    };

    if (category) {
      whereClause.category_id = category as string;
    }

    if (difficulty) {
      whereClause.difficulty_level = difficulty as string;
    }

    const quizzes = await prisma.quiz.findMany({
      where: whereClause,
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

    return res.status(200).json({
      success: true,
      message: 'Quizzes retrieved successfully',
      data: quizzes,
    });
  } catch (error) {
    logger.error('Error fetching quizzes:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const getQuizById = async (req: Request, res: Response) => {
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
      },
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    if (!quiz.is_published) {
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


export const startQuiz = async (req: Request, res: Response) => {
  try {
    const { id: quizId } = req.params;
    const userId = (req.user as any)?.id;

    if (!userId || !quizId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters',
      });
    }

    // Verify quiz exists and is published
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz || !quiz.is_published) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found or not published',
      });
    }

    // Get questions for the quiz (random selection based on quiz settings)
    const questions = await prisma.question.findMany({
      where: { quiz_id: quizId },
      include: {
        options: {
          orderBy: {
            display_order: 'asc',
          },
        },
      },
      orderBy: {
        display_order: 'asc',
      },
      take: quiz.questions_per_attempt,
    });

    if (questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No questions available for this quiz',
      });
    }

    // Create a quiz attempt record
    const attempt = await prisma.userQuizAttempt.create({
      data: {
        user_id: userId,
        quiz_id: quizId,
        total_questions: questions.length,
        status: 'in_progress',
      },
    });

    // Hide correct answers from the response
    const questionsForUser = questions.map(q => ({
      ...q,
      options: q.options.map(opt => ({
        id: opt.id,
        question_id: opt.question_id,
        option_text: opt.option_text,
        option_image_url: opt.option_image_url,
        display_order: opt.display_order,
        created_at: opt.created_at,
        // Don't expose is_correct
      })),
    }));

    res.status(200).json({
      success: true,
      message: 'Quiz started successfully',
      data: {
        attempt_id: attempt.id,
        quiz: {
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          time_limit_minutes: quiz.time_limit_minutes,
        },
        questions: questionsForUser,
        started_at: attempt.started_at,
      },
    });
  } catch (error) {
    logger.error('Error starting quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const submitQuiz = async (req: Request, res: Response) => {
  try {
    const { id: quizId } = req.params;
    const userId = (req.user as any)?.id;
    const { answers } = req.body;

    if (!userId || !quizId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters',
      });
    }

    // Verify quiz exists and is published
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz || !quiz.is_published) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found or not published',
      });
    }

    // Find the active attempt for this user and quiz
    const attempt = await prisma.userQuizAttempt.findFirst({
      where: {
        quiz_id: quizId,
        user_id: userId,
        status: 'in_progress',
      },
      orderBy: {
        started_at: 'desc',
      },
    });

    if (!attempt) {
      return res.status(400).json({
        success: false,
        message: 'No active quiz attempt found',
      });
    }

    // Process answers and calculate scores
    let correctAnswers = 0;
    let totalPoints = 0;
    let earnedPoints = 0;

    const processedAnswers = [];

    for (const userAnswer of answers) {
      const { question_id, selected_options } = userAnswer;

      // Get the actual question and correct answers
      const question = await prisma.question.findUniqueOrThrow({
        where: { id: question_id },
        include: {
          options: true,
        },
      });

      // Create the user answer record
      const answerRecord = await prisma.userAnswer.create({
        data: {
          attempt_id: attempt.id,
          question_id,
          selected_options,
        },
      });

      // Determine if the answer is correct
      // For multiple choice: only one option should be correct
      // For checkbox: all selected options must match correct options exactly
      // For yes/no: treat as single selection
      let isCorrect = false;

      if (question.question_type === 'multiple_choice' || question.question_type === 'yes_no') {
        // For multiple choice, only one option should be correct
        const correctOption = question.options.find(opt => opt.is_correct);
        if (selected_options.length === 1 &&
            correctOption &&
            selected_options[0] === correctOption.id) {
          isCorrect = true;
        }
      } else if (question.question_type === 'checkbox') {
        // For checkbox, all selected options must match all correct options exactly
        const correctOptions = question.options.filter(opt => opt.is_correct);
        const correctOptionIds = correctOptions.map(opt => opt.id).sort();
        const selectedOptionIds = [...selected_options].sort();

        isCorrect = correctOptionIds.length === selectedOptionIds.length &&
                   correctOptionIds.every((val, idx) => val === selectedOptionIds[idx]);
      }

      // Update the answer record with correctness and points
      await prisma.userAnswer.update({
        where: { id: answerRecord.id },
        data: {
          is_correct: Boolean(isCorrect),
          points_earned: isCorrect ? question.points : 0,
        },
      });

      if (isCorrect) {
        correctAnswers++;
        earnedPoints += question.points;
      }
      
      totalPoints += question.points;

      processedAnswers.push({
        ...answerRecord,
        is_correct: isCorrect,
        points_earned: isCorrect ? question.points : 0,
        question_points: question.points,
      });
    }

    // Calculate score percentage
    const scorePercentage = calculateScorePercentage(correctAnswers, answers.length);

    // Update the attempt record
    const updatedAttempt = await prisma.userQuizAttempt.update({
      where: { id: attempt.id },
      data: {
        score: scorePercentage,
        correct_answers: correctAnswers,
        status: 'completed',
        completed_at: new Date(),
      },
    });

    // Update user progress
    await prisma.userProgress.upsert({
      where: {
        user_id_quiz_id: {
          user_id: userId,
          quiz_id: attempt.quiz_id,
        },
      },
      update: {
        total_attempts: { increment: 1 },
        best_score: {
          // Update best score if current score is better
          set: Math.max(attempt.score || 0, scorePercentage),
        },
        last_attempt_at: new Date(),
      },
      create: {
        user_id: userId,
        quiz_id: attempt.quiz_id,
        total_attempts: 1,
        best_score: scorePercentage,
        last_attempt_at: new Date(),
      },
    });

    // Check if user passed and generate certificate if applicable
    const passed = isQuizPassed(scorePercentage, quiz.passing_score);
    let certificateUrl = null;

    if (passed) {
      // Generate certificate
      certificateUrl = `https://api.yourdomain.com/certificates/${userId}/${attempt.quiz_id}?score=${scorePercentage}`;

      // Store certificate in database
      await prisma.certificate.upsert({
        where: {
          user_id_quiz_id: {
            user_id: userId,
            quiz_id: attempt.quiz_id,
          },
        },
        update: {
          score_achieved: scorePercentage,
          certificate_url: certificateUrl,
        },
        create: {
          user_id: userId,
          quiz_id: attempt.quiz_id,
          certificate_url: certificateUrl,
          score_achieved: scorePercentage,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Quiz submitted successfully',
      data: {
        attempt: updatedAttempt,
        score: scorePercentage,
        correct_answers: correctAnswers,
        total_questions: answers.length,
        passed,
        certificate_url: passed ? certificateUrl : null,
      },
    });
  } catch (error) {
    logger.error('Error submitting quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};