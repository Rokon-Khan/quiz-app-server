// src/types/index.ts

// User Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: 'user' | 'admin' | 'super_admin';
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface JWTPayload {
  user_id: string;
  email: string;
  role: 'user' | 'admin' | 'super_admin';
  iat: number;
  exp: number;
}

// Quiz Types
export interface Quiz {
  id: string;
  category_id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  difficulty_level: string;
  questions_per_attempt: number;
  time_limit_minutes: number;
  passing_score: number;
  is_published: boolean;
  created_at: Date;
  updated_at: Date;
}

// Question Types
export interface Question {
  id: string;
  quiz_id: string;
  question_type: 'multiple_choice' | 'checkbox' | 'yes_no';
  question_text: string;
  question_image_url?: string;
  points: number;
  display_order: number;
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface AnswerOption {
  id: string;
  question_id: string;
  option_text?: string;
  option_image_url?: string;
  is_correct: boolean;
  display_order: number;
  created_at: Date;
}

// Quiz Attempt Types
export interface UserQuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  time_taken_seconds: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  started_at: Date;
  completed_at?: Date;
}

export interface UserAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_options: string[]; // Array of option IDs
  is_correct: boolean;
  points_earned: number;
  answered_at: Date;
}

// Request/Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}