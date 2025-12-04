// src/validators/admin.validator.ts
import { z } from "zod";

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, "Category name must be at least 2 characters long"),
    description: z.string().optional(),
    icon_url: z.string().url("Invalid icon URL").optional().nullable(),
    display_order: z.number().int().default(0),
    is_active: z.boolean().default(true),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid category ID"),
  }),
  body: z.object({
    name: z
      .string()
      .min(2, "Category name must be at least 2 characters long")
      .optional(),
    description: z.string().optional(),
    icon_url: z.string().url("Invalid icon URL").optional().nullable(),
    display_order: z.number().int().optional(),
    is_active: z.boolean().optional(),
  }),
});

export const createQuizSchema = z.object({
  category_id: z.string().uuid("Invalid category ID"),
  title: z.string().min(2, "Quiz title must be at least 2 characters long"),
  description: z.string().optional(),
  thumbnail_url: z.string().url("Invalid thumbnail URL").optional().nullable(),
  difficulty_level: z.enum(["easy", "medium", "hard"]).default("medium"),
  questions_per_attempt: z.number().int().positive().default(10),
  time_limit_minutes: z.number().int().min(0).default(0),
  passing_score: z.number().int().min(0).max(100).default(70),
  is_published: z.boolean().default(false),
});

export const updateQuizSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid quiz ID"),
  }),
  body: z.object({
    category_id: z.string().uuid("Invalid category ID").optional(),
    title: z
      .string()
      .min(2, "Quiz title must be at least 2 characters long")
      .optional(),
    description: z.string().optional(),
    thumbnail_url: z
      .string()
      .url("Invalid thumbnail URL")
      .optional()
      .nullable(),
    difficulty_level: z.enum(["easy", "medium", "hard"]).optional(),
    questions_per_attempt: z.number().int().positive().optional(),
    time_limit_minutes: z.number().int().min(0).optional(),
    passing_score: z.number().int().min(0).max(100).optional(),
    is_published: z.boolean().optional(),
  }),
});
