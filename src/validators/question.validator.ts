// src/validators/question.validator.ts
import { z } from 'zod';

export const createQuestionSchema = z.object({
  body: z.object({
    quiz_id: z.string().uuid('Invalid quiz ID'),
    question_type: z.enum(['multiple_choice', 'checkbox', 'yes_no'], {
      errorMap: () => ({ message: 'Question type must be multiple_choice, checkbox, or yes_no' })
    }),
    question_text: z.string().min(1, 'Question text is required'),
    points: z.number().int().positive().default(1),
    display_order: z.number().int().default(0),
    options: z.array(
      z.object({
        option_text: z.string().min(1, 'Option text is required'),
        is_correct: z.boolean().default(false),
        display_order: z.number().int().default(0),
      })
    ).min(2, 'At least 2 options are required'),
    question_image_url: z.string().url('Invalid image URL').optional().nullable(),
    metadata: z.record(z.unknown()).optional().default({}),
  }),
});

export const updateQuestionSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid question ID'),
  }),
  body: z.object({
    question_type: z.enum(['multiple_choice', 'checkbox', 'yes_no'], {
      errorMap: () => ({ message: 'Question type must be multiple_choice, checkbox, or yes_no' })
    }).optional(),
    question_text: z.string().min(1, 'Question text is required').optional(),
    points: z.number().int().positive().optional(),
    display_order: z.number().int().optional(),
    options: z.array(
      z.object({
        id: z.string().uuid('Invalid option ID').optional(),
        option_text: z.string().min(1, 'Option text is required'),
        is_correct: z.boolean().default(false),
        display_order: z.number().int().default(0),
      })
    ).optional(),
    question_image_url: z.string().url('Invalid image URL').optional().nullable(),
    metadata: z.record(z.unknown()).optional(),
  }),
});