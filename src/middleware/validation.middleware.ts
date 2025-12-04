// src/middleware/validation.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error: any) {
      const errorDetails = error.errors?.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message
      })) || [{ field: 'unknown', message: 'Invalid input data' }];
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errorDetails,
      });
    }
  };
};