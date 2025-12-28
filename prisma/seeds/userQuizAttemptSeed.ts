import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedUserQuizAttempts() {
  console.log("Seeding user quiz attempts...");

  const users = await prisma.user.findMany();
  const quizzes = await prisma.quiz.findMany();

  if (users.length === 0) {
    throw new Error("❌ No users found. Run seed:users first.");
  }

  if (quizzes.length === 0) {
    throw new Error("❌ No quizzes found. Run seed:quizzes first.");
  }

  const attempts = [];
  const statuses = ["completed", "in_progress", "abandoned"] as const;

  for (let i = 0; i < 50; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const quiz = quizzes[Math.floor(Math.random() * quizzes.length)];

    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const totalQuestions = Math.floor(Math.random() * 15) + 5;
    const correctAnswers = Math.floor(Math.random() * totalQuestions);
    const score = Math.floor((correctAnswers / totalQuestions) * 100);
    const timeTaken = Math.floor(Math.random() * 1800) + 300;

    const startedAt = new Date(
      Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
    );

    const completedAt =
      status === "completed"
        ? new Date(startedAt.getTime() + timeTaken * 1000)
        : null;

    attempts.push({
      user_id: user!.id,
      quiz_id: quiz!.id,
      score: status === "completed" ? score : 0,
      total_questions: totalQuestions,
      correct_answers: status === "completed" ? correctAnswers : 0,
      time_taken_seconds: status === "completed" ? timeTaken : 0,
      status,
      started_at: startedAt,
      completed_at: completedAt,
    });
  }

  await prisma.userQuizAttempt.createMany({
    data: attempts,
  });

  console.log(`✅ Created ${attempts.length} user quiz attempts`);
}
