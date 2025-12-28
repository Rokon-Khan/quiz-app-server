import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedFunFacts() {
  console.log("Seeding fun facts...");

  const questions = await prisma.question.findMany();
  const funFacts: any[] = [];

  const factTitles = [
    "Did You Know?",
    "Fun Fact",
    "Interesting Info",
    "Quick Tip",
    "Amazing Fact",
    "Cool Detail",
    "Bonus Info",
    "Trivia Time",
    "Knowledge Nugget",
    "Fact Check",
  ];

  const factContents = [
    "This is an interesting fact that adds value to your learning experience.",
    "Here's something cool you might not have known about this topic.",
    "Fun fact: This concept has fascinating real-world applications.",
    "Did you know that this topic connects to many other areas of knowledge?",
    "Interesting tidbit: Experts in this field often use this principle.",
    "Here's a bonus fact that makes this topic even more engaging.",
    "Cool insight: This concept has evolved significantly over time.",
    "Amazing detail: This principle applies in unexpected ways.",
    "Trivia: This topic has some surprising historical connections.",
    "Knowledge boost: Understanding this opens doors to related concepts.",
  ];

  // Create fun facts for first 25 questions
  const selectedQuestions = questions.slice(0, 25);

  selectedQuestions.forEach((question, index) => {
    const title = factTitles[index % factTitles.length];
    const content = factContents[index % factContents.length];

    funFacts.push({
      question_id: question.id,
      title: `${title} #${index + 1}`,
      content: `${content} This relates to the question about "${question.question_text.substring(
        0,
        50
      )}..."`,
      image_url:
        Math.random() > 0.6
          ? `https://via.placeholder.com/300x200/4ECDC4/FFFFFF?text=Fun+Fact+${
              index + 1
            }`
          : null,
    });
  });

  await prisma.funFact.createMany({
    data: funFacts,
    skipDuplicates: true,
  });

  console.log(`✅ Created ${funFacts.length} fun facts`);
}
