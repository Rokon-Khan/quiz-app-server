// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/helpers';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create default admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@wizdommaster.com' },
    update: {},
    create: {
      email: 'admin@wizdommaster.com',
      password_hash: await hashPassword('AdminPass123!'),
      full_name: 'Admin User',
      role: 'admin',
    },
  });

  console.log('Created admin user:', adminUser);

  // Create default categories
  const generalKnowledge = await prisma.category.upsert({
    where: { name: 'General Knowledge' },
    update: {},
    create: {
      name: 'General Knowledge',
      description: 'Test your knowledge on general topics',
      display_order: 1,
    },
  });

  const science = await prisma.category.upsert({
    where: { name: 'Science' },
    update: {},
    create: {
      name: 'Science',
      description: 'Explore the wonders of science',
      display_order: 2,
    },
  });

  const history = await prisma.category.upsert({
    where: { name: 'History' },
    update: {},
    create: {
      name: 'History',
      description: 'Learn about important historical events',
      display_order: 3,
    },
  });

  console.log('Created categories:', { generalKnowledge, science, history });

  // Create sample quizzes
  const generalQuiz = await prisma.quiz.upsert({
    where: { title: 'General Knowledge Quiz' },
    update: {},
    create: {
      title: 'General Knowledge Quiz',
      description: 'Test your general knowledge with this fun quiz!',
      category_id: generalKnowledge.id,
      difficulty_level: 'medium',
      questions_per_attempt: 10,
      passing_score: 70,
      is_published: true,
    },
  });

  const scienceQuiz = await prisma.quiz.upsert({
    where: { title: 'Basic Science Quiz' },
    update: {},
    create: {
      title: 'Basic Science Quiz',
      description: 'Test your knowledge of basic science concepts',
      category_id: science.id,
      difficulty_level: 'medium',
      questions_per_attempt: 8,
      passing_score: 75,
      is_published: true,
    },
  });

  console.log('Created quizzes:', { generalQuiz, scienceQuiz });

  // Create sample questions for General Knowledge Quiz
  const q1 = await prisma.question.create({
    data: {
      quiz_id: generalQuiz.id,
      question_type: 'multiple_choice',
      question_text: 'What is the capital of France?',
      points: 1,
      display_order: 1,
    },
  });

  await prisma.answerOption.createMany({
    data: [
      {
        question_id: q1.id,
        option_text: 'London',
        display_order: 1,
      },
      {
        question_id: q1.id,
        option_text: 'Berlin',
        display_order: 2,
      },
      {
        question_id: q1.id,
        option_text: 'Paris',
        display_order: 3,
        is_correct: true,
      },
      {
        question_id: q1.id,
        option_text: 'Madrid',
        display_order: 4,
      },
    ],
  });

  const q2 = await prisma.question.create({
    data: {
      quiz_id: generalQuiz.id,
      question_type: 'yes_no',
      question_text: 'Is water composed of two hydrogen atoms and one oxygen atom?',
      points: 1,
      display_order: 2,
    },
  });

  await prisma.answerOption.createMany({
    data: [
      {
        question_id: q2.id,
        option_text: 'Yes',
        display_order: 1,
        is_correct: true,
      },
      {
        question_id: q2.id,
        option_text: 'No',
        display_order: 2,
      },
    ],
  });

  // Create sample questions for Science Quiz
  const sq1 = await prisma.question.create({
    data: {
      quiz_id: scienceQuiz.id,
      question_type: 'multiple_choice',
      question_text: 'What is the chemical symbol for gold?',
      points: 1,
      display_order: 1,
    },
  });

  await prisma.answerOption.createMany({
    data: [
      {
        question_id: sq1.id,
        option_text: 'Go',
        display_order: 1,
      },
      {
        question_id: sq1.id,
        option_text: 'Gd',
        display_order: 2,
      },
      {
        question_id: sq1.id,
        option_text: 'Au',
        display_order: 3,
        is_correct: true,
      },
      {
        question_id: sq1.id,
        option_text: 'Ag',
        display_order: 4,
      },
    ],
  });

  console.log('Created sample questions and answers');

  console.log('Seeding completed successfully!');
}

main()
  .catch(e => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });