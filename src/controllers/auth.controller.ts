// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import { prisma } from "../config/database";
import { comparePassword, hashPassword } from "../utils/helpers";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { logger } from "../utils/logger";

interface RegisterRequestBody {
  email: string;
  password: string;
  full_name: string;
}

interface LoginRequestBody {
  email: string;
  password: string;
}

interface ForgotPasswordRequestBody {
  email: string;
}

interface ChangePasswordRequestBody {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// interface ResetPasswordRequestBody {
//   token: string;
//   password: string;
// }

export const register = async (
  req: Request<{}, {}, RegisterRequestBody>,
  res: Response
) => {
  try {
    const { email, password, full_name } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
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

    // TODO: In a real application, you would store the refresh token in a database
    // and implement refresh token rotation for security

    // Set cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env["NODE_ENV"] === "production",
      sameSite: "strict",
      maxAge: 86400, // 24 hours
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env["NODE_ENV"] === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Don't send password hash in response
    const { password_hash, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    logger.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const login = async (
  req: Request<{}, {}, LoginRequestBody>,
  res: Response
) => {
  try {
    const { email, password } = req.body;

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare the password
    const isPasswordValid = await comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
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

    // Set cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env["NODE_ENV"] === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env["NODE_ENV"] === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Don't send password hash in response
    const { password_hash, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    logger.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    let token = req.body.refresh_token || req.cookies?.["refreshToken"];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not provided",
      });
    }

    const decodedData = await verifyRefreshToken(token);

    const userData = await prisma.user.findUnique({
      where: {
        id: decodedData.user_id,
        is_active: true,
      },
    });

    if (!userData) {
      return res.status(401).json({
        success: false,
        message: "User not found or inactive",
      });
    }

    const accessToken = generateAccessToken({
      user_id: userData.id,
      email: userData.email,
      role: userData.role as "user" | "admin" | "super_admin",
    });

    // Set new access token cookie
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env["NODE_ENV"] === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        accessToken,
      },
    });
  } catch (error) {
    logger.error("Refresh token error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token",
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    // Clear cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    logger.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const forgotPassword = async (
  req: Request<{}, {}, ForgotPasswordRequestBody>,
  res: Response
) => {
  // TODO: Implement forgot password logic
  // This would involve generating a password reset token and sending an email
  return res.status(501).json({
    success: false,
    message: "Forgot password functionality not yet implemented",
  });
};

export const resetPassword = async (
  req: Request<{}, {}, { password: string }>,
  res: Response
) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // user injected by auth middleware
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const hashedPassword = await hashPassword(password);

    await prisma.user.update({
      where: { id: userId },
      data: { password_hash: hashedPassword },
    });

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to reset password",
    });
  }
};

export const changePassword = async (
  req: Request<{}, {}, ChangePasswordRequestBody>,
  res: Response
) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = (req.user as any)?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Validate new password confirmation
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirmation do not match",
      });
    }

    // Validate new password strength (optional)
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(
      currentPassword,
      user.password_hash
    );

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Check if new password is same as current password
    const isSamePassword = await comparePassword(
      newPassword,
      user.password_hash
    );

    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
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

    // Generate new tokens (optional - forces re-authentication on other devices)
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

    // Update cookies with new tokens
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env["NODE_ENV"] === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env["NODE_ENV"] === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Don't send password hash in response
    const { password_hash, ...userWithoutPassword } = updatedUser;

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    logger.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        full_name: true,
        avatar_url: true,
        address: true,
        phone_number: true,
        bio: true,
        role: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User profile retrieved successfully",
      data: user,
    });
  } catch (error) {
    logger.error("Error fetching user profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
