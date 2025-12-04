// src/validators/quiz.validator.ts
import { z } from 'zod';

export const startQuizSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid quiz ID'),
  }),
});

export const submitQuizSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid quiz ID'),
  }),
  body: z.object({
    answers: z.array(
      z.object({
        question_id: z.string().uuid('Invalid question ID'),
        selected_options: z.array(z.string().uuid('Invalid option ID')),
      })
    ),
  }),
});