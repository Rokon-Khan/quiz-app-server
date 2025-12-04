// src/server.ts
import { app } from './app';
import { env } from './config/env';
import { prisma } from './config/database';
import { logger } from './utils/logger';

const startServer = async () => {
  try {
    // Connect to database
    await prisma.$connect();
    logger.info('Connected to the database successfully');

    // Start the server
    const server = app.listen(env.PORT, () => {
      logger.info(`Quiz API server is running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      logger.info(`Health check available at http://localhost:${env.PORT}/health`);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(async () => {
        await prisma.$disconnect();
        logger.info('Database connection closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      logger.info('SIGINT received, shutting down gracefully');
      server.close(async () => {
        await prisma.$disconnect();
        logger.info('Database connection closed');
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error('Failed to start the server:', error);
    process.exit(1);
  }
};

startServer();