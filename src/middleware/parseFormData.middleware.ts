// src/middlewares/parseFormDataBody.middleware.ts
import { NextFunction, Request, Response } from "express";

export const parseFormDataBody = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.body) return next();

  try {
    // numbers
    if (req.body.points !== undefined) {
      req.body.points = Number(req.body.points);
    }

    if (req.body.display_order !== undefined) {
      req.body.display_order = Number(req.body.display_order);
    }

    // JSON fields
    if (typeof req.body.options === "string") {
      req.body.options = JSON.parse(req.body.options);
    }

    if (typeof req.body.fun_facts === "string") {
      req.body.fun_facts = JSON.parse(req.body.fun_facts);
    }

    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid form data",
      errors: [{ field: "body", message: "Malformed JSON in form data" }],
    });
  }
};
