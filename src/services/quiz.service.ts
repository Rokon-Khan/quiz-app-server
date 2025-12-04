// src/services/quiz.service.ts
import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import { calculateScorePercentage, isQuizPassed } from '../utils/helpers';

export class QuizService {
  /**
   * Get all quizzes with optional filters
   */
  static async getAllQuizzes(filters: {
    category?: string;
    difficulty?: string;
    published?: boolean;
  } = {}) {
    try {
      const whereClause: any = {
        is_published: filters.published !== undefined ? filters.published : true,
      };

      if (filters.category) {
        whereClause.category_id = filters.category;
      }

      if (filters.difficulty) {
        whereClause.difficulty_level = filters.difficulty;
      }

      return await prisma.quiz.findMany({
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
    } catch (error) {
      logger.error('Error in getAllQuizzes service:', error);
      throw error;
    }
  }

  /**
   * Get a specific quiz by ID
   */
  static async getQuizById(id: string) {
    try {
      return await prisma.quiz.findUnique({
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
    } catch (error) {
      logger.error('Error in getQuizById service:', error);
      throw error;
    }
  }

  /**
   * Start a quiz attempt for a user
   */
  static async startQuiz(userId: string, quizId: string) {
    try {
      // Verify quiz exists and is published
      const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
      });

      if (!quiz || !quiz.is_published) {
        throw new Error('Quiz not found or not published');
      }

      // Get questions for the quiz
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
        throw new Error('No questions available for this quiz');
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
        })),
      }));

      return {
        attempt_id: attempt.id,
        quiz: {
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          time_limit_minutes: quiz.time_limit_minutes,
        },
        questions: questionsForUser,
        started_at: attempt.started_at,
      };
    } catch (error) {
      logger.error('Error in startQuiz service:', error);
      throw error;
    }
  }

  /**
   * Submit quiz answers and calculate results
   */
  static async submitQuiz(attemptId: string, userId: string, answers: any[]) {
    try {
      // Find the active attempt for this user
      const attempt = await prisma.userQuizAttempt.findFirst({
        where: {
          id: attemptId,
          user_id: userId,
          status: 'in_progress',
        },
        orderBy: {
          started_at: 'desc',
        },
      });

      if (!attempt) {
        throw new Error('No active quiz attempt found');
      }

      // Get the quiz to access passing score
      const quiz = await prisma.quiz.findUnique({
        where: { id: attempt.quiz_id },
      });

      if (!quiz) {
        throw new Error('Quiz not found');
      }

      // Process answers and calculate scores
      let correctAnswers = 0;
      let totalPoints = 0;
      let earnedPoints = 0;

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

      return {
        attempt: updatedAttempt,
        score: scorePercentage,
        correct_answers: correctAnswers,
        total_questions: answers.length,
        passed,
        certificate_url: passed ? certificateUrl : null,
      };
    } catch (error) {
      logger.error('Error in submitQuiz service:', error);
      throw error;
    }
  }
}