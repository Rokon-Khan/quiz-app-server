// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { hashPassword, comparePassword } from '../utils/helpers';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { logger } from '../utils/logger';

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

interface ResetPasswordRequestBody {
  token: string;
  password: string;
}

export const register = async (req: Request<{}, {}, RegisterRequestBody>, res: Response) => {
  try {
    const { email, password, full_name } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
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
      role: user.role as 'user' | 'admin' | 'super_admin',
    });

    const refreshToken = generateRefreshToken({
      user_id: user.id,
      email: user.email,
      role: user.role as 'user' | 'admin' | 'super_admin',
    });

    // TODO: In a real application, you would store the refresh token in a database
    // and implement refresh token rotation for security

    // Don't send password hash in response
    const { password_hash, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const login = async (req: Request<{}, {}, LoginRequestBody>, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Compare the password
    const isPasswordValid = await comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
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

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  // TODO: Implement refresh token logic
  // This would involve validating the refresh token, checking it against a stored value,
  // generating new access/refresh tokens, and returning them
  return res.status(501).json({
    success: false,
    message: 'Refresh token functionality not yet implemented',
  });
};

export const logout = async (req: Request, res: Response) => {
  // TODO: Implement logout logic
  // This would typically involve invalidating the refresh token
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

export const forgotPassword = async (req: Request<{}, {}, ForgotPasswordRequestBody>, res: Response) => {
  // TODO: Implement forgot password logic
  // This would involve generating a password reset token and sending an email
  return res.status(501).json({
    success: false,
    message: 'Forgot password functionality not yet implemented',
  });
};

export const resetPassword = async (req: Request<{}, {}, ResetPasswordRequestBody>, res: Response) => {
  // TODO: Implement reset password logic
  // This would involve validating the reset token and updating the password
  return res.status(501).json({
    success: false,
    message: 'Reset password functionality not yet implemented',
  });
};