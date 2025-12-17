import { PrismaClient } from '@prisma/client';
import { seedUsers } from './userSeed';
import { seedCategories } from './categorySeed';
import { seedQuizzes } from './quizSeed';
import { seedQuestions } from './questionSeed';
import { seedAnswerOptions } from './answerOptionSeed';
import { seedFunFacts } from './funFactSeed';
import { seedUserQuizAttempts } from './userQuizAttemptSeed';
import { seedUserAnswers } from './userAnswerSeed';
import { seedUserProgress } from './userProgressSeed';
import { seedCertificates } from './certificateSeed';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');
  
  try {
    // Seed in order of dependencies
    await seedUsers();
    await seedCategories();
    await seedQuizzes();
    await seedQuestions();
    await seedAnswerOptions();
    await seedFunFacts();
    await seedUserQuizAttempts();
    await seedUserAnswers();
    await seedUserProgress();
    await seedCertificates();
    
    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();