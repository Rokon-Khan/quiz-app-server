// src/middleware/auth.middleware.ts
import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/database";
import { verifyAccessToken } from "../utils/jwt";

// Authentication middleware
export const authenticate = async (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
) => {
  try {
    let token = req.headers.authorization;

    // Remove 'Bearer ' prefix if present
    if (token && token.startsWith("Bearer ")) {
      token = token.slice(7);
    }

    // If no token in header, check cookies
    if (!token) {
      token = req.cookies?.["accessToken"];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "You are not authorized!",
      });
    }

    const verifiedUser = await verifyAccessToken(token);

    // Get full user data from database
    const user = await prisma.user.findUnique({
      where: { id: verifiedUser.user_id },
    });

    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: "User not found or inactive!",
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
    };

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token!",
    });
  }
};

// Authorization middleware for admin access
export const authorizeAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user && (req.user as any).role === "admin") {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Forbidden!",
    });
  }
};

// Authorization middleware for specific roles
export const auth = (...roles: string[]) => {
  return async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ) => {
    try {
      let token = req.headers.authorization;

      // Remove 'Bearer ' prefix if present
      if (token && token.startsWith("Bearer ")) {
        token = token.slice(7);
      }

      // If no token in header, check cookies
      if (!token) {
        token = req.cookies?.["accessToken"];
      }

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "You are not authorized!",
        });
      }

      const verifiedUser = await verifyAccessToken(token);

      // Get full user data from database
      const user = await prisma.user.findUnique({
        where: { id: verifiedUser.user_id },
      });

      if (!user || !user.is_active) {
        return res.status(401).json({
          success: false,
          message: "User not found or inactive!",
        });
      }

      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
      };

      if (roles.length && !roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden!",
        });
      }

      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token!",
      });
    }
  };
};
