// src/services/auth.service.ts
import { prisma } from "../config/database";
import { comparePassword, hashPassword } from "../utils/helpers";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import { logger } from "../utils/logger";

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

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
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
        throw new Error("User with this email already exists");
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
        role: user.role as "user" | "admin" | "super_admin",
      });

      const refreshToken = generateRefreshToken({
        user_id: user.id,
        email: user.email,
        role: user.role as "user" | "admin" | "super_admin",
      });

      // Don't send password hash in response
      const { password_hash, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword as UserResponse,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      logger.error("Registration error in service:", error);
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
        throw new Error("Invalid email or password");
      }

      // Compare the password
      const isPasswordValid = await comparePassword(
        password,
        user.password_hash
      );

      if (!isPasswordValid) {
        throw new Error("Invalid email or password");
      }

      // Generate tokens
      const accessToken = generateAccessToken({
        user_id: user.id,
        email: user.email,
        role: user.role as "user" | "admin" | "super_admin",
      });

      const refreshToken = generateRefreshToken({
        user_id: user.id,
        email: user.email,
        role: user.role as "user" | "admin" | "super_admin",
      });

      // Don't send password hash in response
      const { password_hash, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword as UserResponse,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      logger.error("Login error in service:", error);
      throw error;
    }
  }

  static async resetPassword(userId: string, newPassword: string) {
    try {
      const hashedPassword = await hashPassword(newPassword);

      await prisma.user.update({
        where: { id: userId },
        data: {
          password_hash: hashedPassword,
        },
      });

      return true;
    } catch (error) {
      logger.error("Reset password error in service:", error);
      throw error;
    }
  }

  /**
   * Change password for logged-in user
   */
  static async changePassword(
    userId: string,
    passwordData: ChangePasswordData
  ) {
    try {
      const { currentPassword, newPassword, confirmPassword } = passwordData;

      // Validate new password confirmation
      if (newPassword !== confirmPassword) {
        throw new Error("New password and confirmation do not match");
      }

      // Validate new password strength (optional)
      if (newPassword.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }

      // Find the user
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Verify current password
      const isCurrentPasswordValid = await comparePassword(
        currentPassword,
        user.password_hash
      );

      if (!isCurrentPasswordValid) {
        throw new Error("Current password is incorrect");
      }

      // Check if new password is same as current password
      const isSamePassword = await comparePassword(
        newPassword,
        user.password_hash
      );

      if (isSamePassword) {
        throw new Error("New password must be different from current password");
      }

      // Hash the new password
      const hashedNewPassword = await hashPassword(newPassword);

      // Update the password
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          password_hash: hashedNewPassword,
          updated_at: new Date(),
        },
      });

      // Generate new tokens (optional - for security, you might want to invalidate old sessions)
      const accessToken = generateAccessToken({
        user_id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role as "user" | "admin" | "super_admin",
      });

      const refreshToken = generateRefreshToken({
        user_id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role as "user" | "admin" | "super_admin",
      });

      // Don't send password hash in response
      const { password_hash, ...userWithoutPassword } = updatedUser;

      return {
        user: userWithoutPassword as UserResponse,
        accessToken,
        refreshToken,
        message: "Password changed successfully",
      };
    } catch (error) {
      logger.error("Change password error in service:", error);
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
      logger.error("Error fetching user by ID in service:", error);
      throw error;
    }
  }

  /**
   * Get My Profile
   */
  static async getMe(userId: string) {
    try {
      return await prisma.user.findUnique({
        where: { id: userId },
      });
    } catch (error) {
      logger.error("Error fetching user by ID in service:", error);
      throw error;
    }
  }
}
