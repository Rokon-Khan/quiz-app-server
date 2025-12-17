import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedCertificates() {
  console.log('Seeding certificates...');
  
  const users = await prisma.user.findMany();
  const quizzes = await prisma.quiz.findMany();
  const certificates = [];

  // Create certificates for 20 user-quiz combinations
  for (let i = 0; i < 20; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const quiz = quizzes[Math.floor(Math.random() * quizzes.length)];
    
    // Check if this combination already exists
    const existingCertificate = certificates.find(c => c.user_id === user.id && c.quiz_id === quiz.id);
    if (existingCertificate) {
      i--; // Try again with different combination
      continue;
    }

    const scoreAchieved = Math.floor(Math.random() * 30) + 70; // 70-100% (passing scores only)
    const issuedAt = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000); // Last 30 days
    const certificateUrl = `https://certificates.wizdommaster.com/${user.id}/${quiz.id}/${Date.now()}.pdf`;

    certificates.push({
      user_id: user.id,
      quiz_id: quiz.id,
      certificate_url: certificateUrl,
      score_achieved: scoreAchieved,
      issued_at: issuedAt
    });
  }

  await prisma.certificate.createMany({
    data: certificates,
    skipDuplicates: true
  });

  console.log(`✅ Created ${certificates.length} certificates`);
}