import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedUserAnswers() {
  console.log("Seeding user answers...");

  const attempts = await prisma.userQuizAttempt.findMany({
    where: { status: "completed" },
    include: {
      quiz: { include: { questions: { include: { options: true } } } },
    },
  });

  const userAnswers: any[] = [];

  // Create answers for first 50 completed attempts
  const selectedAttempts = attempts.slice(0, 50);

  selectedAttempts.forEach((attempt) => {
    const questions = attempt.quiz.questions.slice(0, 1); // 1 answer per attempt for 50 total

    questions.forEach((question) => {
      const availableOptions = question.options;
      if (availableOptions.length === 0) return;

      const isCorrect = Math.random() > 0.3; // 70% correct answers
      const correctOptions = availableOptions.filter((opt) => opt.is_correct);
      const incorrectOptions = availableOptions.filter(
        (opt) => !opt.is_correct
      );

      let selectedOptions;
      if (question.question_type === "checkbox") {
        // For checkbox, select 1-3 options
        const numToSelect = Math.floor(Math.random() * 3) + 1;
        const optionsToChooseFrom = isCorrect
          ? correctOptions
          : availableOptions;
        selectedOptions = optionsToChooseFrom
          .sort(() => 0.5 - Math.random())
          .slice(0, numToSelect)
          .map((opt) => opt.id);
      } else {
        // For multiple choice and yes/no, select one option
        const optionsToChooseFrom = isCorrect
          ? correctOptions
          : incorrectOptions;
        selectedOptions =
          optionsToChooseFrom.length > 0
            ? [
                optionsToChooseFrom[
                  Math.floor(Math.random() * optionsToChooseFrom.length)
                ]?.id,
              ]
            : [availableOptions[0]?.id];
      }

      const pointsEarned = isCorrect ? question.points : 0;

      userAnswers.push({
        attempt_id: attempt?.id,
        question_id: question?.id,
        selected_options: JSON.stringify(selectedOptions),
        is_correct: isCorrect,
        points_earned: pointsEarned,
        answered_at: new Date(
          attempt.started_at.getTime() + Math.floor(Math.random() * 1800000)
        ), // Random time during attempt
      });
    });
  });

  if (userAnswers.length > 0) {
    await prisma.userAnswer.createMany({
      data: userAnswers,
      skipDuplicates: true,
    });
  }

  console.log(`✅ Created ${userAnswers.length} user answers`);
}
