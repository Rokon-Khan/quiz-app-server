// src/services/upload.service.ts
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export class UploadService {
  private static s3Client = new S3Client({
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  });

  /**
   * Upload image to S3
   */
  static async uploadImage(file: Express.Multer.File, folder: string = 'images') {
    try {
      // Generate unique key for the file
      const key = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}-${file.originalname}`;

      const command = new PutObjectCommand({
        Bucket: env.S3_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          originalName: file.originalname,
          uploadedAt: new Date().toISOString(),
        },
      });

      await UploadService.s3Client.send(command);

      // Return the public URL
      const publicUrl = `https://${env.S3_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
      
      return {
        key,
        url: publicUrl,
        originalName: file.originalname,
        size: file.size,
        type: file.mimetype,
      };
    } catch (error) {
      logger.error('Error uploading image to S3:', error);
      throw error;
    }
  }

  /**
   * Generate presigned URL for uploading
   */
  static async generatePresignedUploadUrl(key: string, expiresIn: number = 3600) {
    try {
      const command = new PutObjectCommand({
        Bucket: env.S3_BUCKET_NAME,
        Key: key,
      });

      const url = await getSignedUrl(UploadService.s3Client, command, { expiresIn });
      
      return {
        url,
        fields: {
          key,
        },
      };
    } catch (error) {
      logger.error('Error generating presigned upload URL:', error);
      throw error;
    }
  }

  /**
   * Delete image from S3
   */
  static async deleteImage(key: string) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: env.S3_BUCKET_NAME,
        Key: key,
      });

      await UploadService.s3Client.send(command);
      
      return {
        success: true,
        message: 'Image deleted successfully',
      };
    } catch (error) {
      logger.error('Error deleting image from S3:', error);
      throw error;
    }
  }
}