// src/middleware/upload.middleware.ts
import multer from 'multer';
import path from 'path';
import { Request } from 'express';

// Configure storage for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter to allow only images
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// Configure multer upload
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Single image upload middleware
export const uploadSingleImage = (fieldName: string) => {
  return upload.single(fieldName);
};

// Multiple image upload middleware
export const uploadMultipleImages = (fieldName: string, maxCount: number) => {
  return upload.fields([{ name: fieldName, maxCount }]);
};