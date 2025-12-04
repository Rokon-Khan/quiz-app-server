// src/utils/helpers.ts
import bcrypt from 'bcrypt';

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Compare password
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

// Generate random string
export const generateRandomString = (length: number): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Format date to ISO string
export const formatDate = (date: Date): string => {
  return new Date(date).toISOString();
};

// Calculate quiz score percentage
export const calculateScorePercentage = (correct: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
};

// Generate quiz certificate URL (placeholder - would integrate with actual certificate generation)
export const generateCertificateUrl = (userId: string, quizId: string, score: number): string => {
  // In a real implementation, this would generate an actual certificate
  return `https://api.yourdomain.com/certificates/${userId}/${quizId}?score=${score}`;
};

// Check if quiz is passed based on passing score
export const isQuizPassed = (score: number, passingScore: number): boolean => {
  return score >= passingScore;
};

// Format time in seconds to human readable format
export const formatTime = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hrs > 0) {
    return `${hrs}h ${mins}m ${secs}s`;
  } else if (mins > 0) {
    return `${mins}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};