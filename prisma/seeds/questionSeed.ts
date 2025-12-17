import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedQuestions() {
  console.log("Seeding questions...");

  const quizzes = await prisma.quiz.findMany();
  
  if (quizzes.length === 0) {
    throw new Error('No quizzes found. Run quiz seed first.');
  }
  
  const questions = [];

  const questionTypes = ["multiple_choice", "checkbox", "yes_no"];
  const sampleQuestions = [
    "What is the correct answer?",
    "Which of the following is true?",
    "Select the best option:",
    "What do you think about this?",
    "Is this statement correct?",
    "Choose the right answer:",
    "What is your opinion on this?",
    "Which option is most accurate?",
    "Do you agree with this statement?",
    "What would be the best approach?",
  ];

  for (let i = 1; i <= 100; i++) {
    const quiz = quizzes[Math.floor(Math.random() * quizzes.length)]!;
    const questionType =
      questionTypes[Math.floor(Math.random() * questionTypes.length)]!;
    const questionText =
      sampleQuestions[Math.floor(Math.random() * sampleQuestions.length)]!;

    questions.push({
      quiz_id: quiz.id,
      question_type: questionType,
      question_text: `${questionText} (Question ${i})`,
      question_image_url:
        Math.random() > 0.7
          ? `https://via.placeholder.com/400x300/36A2EB/FFFFFF?text=Question+${i}`
          : null,
      points: Math.floor(Math.random() * 5) + 1, // 1-5 points
      display_order: i,
      metadata: JSON.stringify({
        difficulty: quiz.difficulty_level,
        category: "general",
      }),
    });
  }

  await prisma.question.createMany({
    data: questions,
    skipDuplicates: true,
  });

  console.log(`✅ Created ${questions.length} questions`);
}
