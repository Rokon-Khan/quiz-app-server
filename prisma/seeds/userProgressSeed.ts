import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedUserProgress() {
  console.log('Seeding user progress...');
  
  const users = await prisma.user.findMany();
  const quizzes = await prisma.quiz.findMany();
  const progress = [];

  // Create progress for 25 user-quiz combinations
  for (let i = 0; i < 25; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const quiz = quizzes[Math.floor(Math.random() * quizzes.length)];
    
    // Check if this combination already exists
    const existingProgress = progress.find(p => p.user_id === user.id && p.quiz_id === quiz.id);
    if (existingProgress) {
      i--; // Try again with different combination
      continue;
    }

    const totalAttempts = Math.floor(Math.random() * 5) + 1; // 1-5 attempts
    const bestScore = Math.floor(Math.random() * 40) + 60; // 60-100%
    const totalTimeSpent = Math.floor(Math.random() * 7200) + 600; // 10 minutes to 2 hours
    const lastAttemptAt = new Date(Date.now() - Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000); // Last 14 days

    progress.push({
      user_id: user.id,
      quiz_id: quiz.id,
      total_attempts: totalAttempts,
      best_score: bestScore,
      total_time_spent: totalTimeSpent,
      last_attempt_at: lastAttemptAt
    });
  }

  await prisma.userProgress.createMany({
    data: progress,
    skipDuplicates: true
  });

  console.log(`✅ Created ${progress.length} user progress records`);
}