import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function seedUsers() {
  console.log("Seeding users...");

  const users = [];

  // Create admin user
  users.push({
    // email: "admin@wizdommaster.com",
    email: "admin@admin.com",
    password_hash: await bcrypt.hash("admin123", 12),
    full_name: "Admin User",
    role: "admin",
    avatar_url: "https://via.placeholder.com/150/0000FF/FFFFFF?text=Admin",
  });

  // Create regular users
  for (let i = 1; i <= 49; i++) {
    users.push({
      email: `user${i}@example.com`,
      password_hash: await bcrypt.hash("password123", 12),
      full_name: `User ${i}`,
      role: "user",
      avatar_url: `https://via.placeholder.com/150/FF0000/FFFFFF?text=U${i}`,
    });
  }

  await prisma.user.createMany({
    data: users,
    skipDuplicates: true,
  });

  console.log(`✅ Created ${users.length} users`);
}
