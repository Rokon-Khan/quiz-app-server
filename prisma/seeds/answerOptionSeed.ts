import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedAnswerOptions() {
  console.log("Seeding answer options...");

  const questions = await prisma.question.findMany();
  const answerOptions: any[] = [];

  const optionTexts = [
    "Option A",
    "Option B",
    "Option C",
    "Option D",
    "True",
    "False",
    "Yes",
    "No",
    "Maybe",
    "Correct Answer",
    "Wrong Answer",
    "Partially Correct",
    "First Choice",
    "Second Choice",
    "Third Choice",
    "Fourth Choice",
  ];

  // Create options for first 50 questions only (as requested 50 answer options)
  const selectedQuestions = questions.slice(0, 13); // ~4 options per question for 50 total

  selectedQuestions.forEach((question, qIndex) => {
    const numOptions = question.question_type === "yes_no" ? 2 : 4;

    for (let i = 0; i < numOptions; i++) {
      const isCorrect = i === 0; // First option is correct
      const optionText =
        question.question_type === "yes_no"
          ? i === 0
            ? "Yes"
            : "No"
          : `${optionTexts[i % optionTexts.length]} for Q${qIndex + 1}`;

      answerOptions.push({
        question_id: question.id,
        option_text: optionText,
        option_image_url:
          Math.random() > 0.8
            ? `https://via.placeholder.com/200x150/FF6B6B/FFFFFF?text=Option+${
                i + 1
              }`
            : null,
        is_correct: isCorrect,
        display_order: i + 1,
      });
    }
  });

  await prisma.answerOption.createMany({
    data: answerOptions,
    skipDuplicates: true,
  });

  console.log(`✅ Created ${answerOptions.length} answer options`);
}
