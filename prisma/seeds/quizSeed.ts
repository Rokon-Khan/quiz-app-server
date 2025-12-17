import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedQuizzes() {
  console.log("Seeding quizzes...");

  const categories = await prisma.category.findMany();

  if (categories.length === 0) {
    throw new Error("No categories found. Run category seed first.");
  }
  const quizzes = [];

  const difficulties = ["easy", "medium", "hard"];
  const quizTitles = [
    "Beginner Challenge",
    "Advanced Test",
    "Expert Level",
    "Quick Quiz",
    "Master Class",
    "Foundation Quiz",
    "Intermediate Test",
    "Pro Challenge",
    "Ultimate Quiz",
    "Speed Test",
  ];

  for (let i = 1; i <= 100; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)]!;
    const difficulty =
      difficulties[Math.floor(Math.random() * difficulties.length)];
    const title = quizTitles[Math.floor(Math.random() * quizTitles.length)];

    quizzes.push({
      category_id: category.id,
      title: `${category.name} ${title} ${i}`,
      description: `Test your knowledge in ${category.name} with this ${difficulty} level quiz`,
      thumbnail_url: `https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=${category.name}+Quiz`,
      difficulty_level: difficulty,
      questions_per_attempt: Math.floor(Math.random() * 15) + 5, // 5-20 questions
      time_limit_minutes: Math.floor(Math.random() * 30) + 10, // 10-40 minutes
      passing_score: Math.floor(Math.random() * 30) + 60, // 60-90%
      is_published: Math.random() > 0.2, // 80% published
    });
  }

  await prisma.quiz.createMany({
    data: quizzes,
    skipDuplicates: true,
  });

  console.log(`✅ Created ${quizzes.length} quizzes`);
}
