import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedCategories() {
  console.log("Seeding categories...");

  const categories = [
    {
      name: "Technology",
      description: "Programming, AI, and tech trends",
      icon_url: "https://via.placeholder.com/64/4CAF50/FFFFFF?text=T",
      display_order: 1,
    },
    {
      name: "Science",
      description: "Physics, Chemistry, Biology",
      icon_url: "https://via.placeholder.com/64/2196F3/FFFFFF?text=S",
      display_order: 2,
    },
    {
      name: "History",
      description: "World history and civilizations",
      icon_url: "https://via.placeholder.com/64/FF9800/FFFFFF?text=H",
      display_order: 3,
    },
    {
      name: "Geography",
      description: "Countries, capitals, and landmarks",
      icon_url: "https://via.placeholder.com/64/8BC34A/FFFFFF?text=G",
      display_order: 4,
    },
    {
      name: "Sports",
      description: "Football, basketball, and more",
      icon_url: "https://via.placeholder.com/64/FF5722/FFFFFF?text=SP",
      display_order: 5,
    },
    {
      name: "Movies",
      description: "Cinema and entertainment",
      icon_url: "https://via.placeholder.com/64/9C27B0/FFFFFF?text=M",
      display_order: 6,
    },
    {
      name: "Music",
      description: "Artists, genres, and instruments",
      icon_url: "https://via.placeholder.com/64/E91E63/FFFFFF?text=MU",
      display_order: 7,
    },
    {
      name: "Literature",
      description: "Books, authors, and poetry",
      icon_url: "https://via.placeholder.com/64/795548/FFFFFF?text=L",
      display_order: 8,
    },
    {
      name: "Art",
      description: "Paintings, sculptures, and artists",
      icon_url: "https://via.placeholder.com/64/607D8B/FFFFFF?text=A",
      display_order: 9,
    },
    {
      name: "Food & Cooking",
      description: "Recipes, cuisines, and nutrition",
      icon_url: "https://via.placeholder.com/64/FFC107/FFFFFF?text=F",
      display_order: 10,
    },
    {
      name: "Health & Fitness",
      description: "Wellness and exercise",
      icon_url: "https://via.placeholder.com/64/4CAF50/FFFFFF?text=HF",
      display_order: 11,
    },
    {
      name: "Business",
      description: "Entrepreneurship and finance",
      icon_url: "https://via.placeholder.com/64/3F51B5/FFFFFF?text=B",
      display_order: 12,
    },
    {
      name: "Mathematics",
      description: "Algebra, geometry, and calculus",
      icon_url: "https://via.placeholder.com/64/009688/FFFFFF?text=MA",
      display_order: 13,
    },
    {
      name: "Languages",
      description: "Grammar, vocabulary, and linguistics",
      icon_url: "https://via.placeholder.com/64/FF4081/FFFFFF?text=LA",
      display_order: 14,
    },
    {
      name: "General Knowledge",
      description: "Mixed topics and trivia",
      icon_url: "https://via.placeholder.com/64/9E9E9E/FFFFFF?text=GK",
      display_order: 15,
    },
  ];

  for (const category of categories) {
    await prisma.category.create({
      data: category,
    });
  }

  console.log(`✅ Created ${categories.length} categories`);
}
