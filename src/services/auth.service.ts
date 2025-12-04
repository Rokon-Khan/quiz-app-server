// src/services/auth.service.ts
import { prisma } from '../config/database';
import { hashPassword, comparePassword } from '../utils/helpers';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { logger } from '../utils/logger';

interface RegisterUserData {
  email: string;
  password: string;
  full_name: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface UserResponse {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string | null;
  role: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export class AuthService {
  /**
   * Register a new user
   */
  static async register(userData: RegisterUserData) {
    try {
      const { email, password, full_name } = userData;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash the password
      const hashedPassword = await hashPassword(password);

      // Create the user
      const user = await prisma.user.create({
        data: {
          email,
          password_hash: hashedPassword,
          full_name,
        },
      });

      // Generate tokens
      const accessToken = generateAccessToken({
        user_id: user.id,
        email: user.email,
        role: user.role as 'user' | 'admin' | 'super_admin',
      });

      const refreshToken = generateRefreshToken({
        user_id: user.id,
        email: user.email,
        role: user.role as 'user' | 'admin' | 'super_admin',
      });

      // Don't send password hash in response
      const { password_hash, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword as UserResponse,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      logger.error('Registration error in service:', error);
      throw error;
    }
  }

  /**
   * Authenticate user login
   */
  static async login(credentials: LoginCredentials) {
    try {
      const { email, password } = credentials;

      // Find the user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Compare the password
      const isPasswordValid = await comparePassword(password, user.password_hash);

      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Generate tokens
      const accessToken = generateAccessToken({
        user_id: user.id,
        email: user.email,
        role: user.role as 'user' | 'admin' | 'super_admin',
      });

      const refreshToken = generateRefreshToken({
        user_id: user.id,
        email: user.email,
        role: user.role as 'user' | 'admin' | 'super_admin',
      });

      // Don't send password hash in response
      const { password_hash, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword as UserResponse,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      logger.error('Login error in service:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string) {
    try {
      return await prisma.user.findUnique({
        where: { id: userId },
      });
    } catch (error) {
      logger.error('Error fetching user by ID in service:', error);
      throw error;
    }
  }
}