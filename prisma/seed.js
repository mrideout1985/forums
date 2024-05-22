import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Find the existing user by name (assuming name is unique)
  const existingUser = await prisma.user.findFirst({
    where: {
      name: "cockring6866",
    },
  });

  if (!existingUser) {
    throw new Error('User with name "cockring6866" not found');
  }

  // Upsert some categories
  const category1 = await prisma.category.upsert({
    where: { name: "General Discussion" },
    update: {},
    create: {
      name: "General Discussion",
    },
  });

  const category2 = await prisma.category.upsert({
    where: { name: "Announcements" },
    update: {},
    create: {
      name: "Announcements",
    },
  });

  const category3 = await prisma.category.upsert({
    where: { name: "Support" },
    update: {},
    create: {
      name: "Support",
    },
  });

  // Create some posts
  const post1 = await prisma.post.create({
    data: {
      name: "Welcome to the forum!",
      createdById: existingUser.id,
      categoryId: category1.id,
    },
  });

  const post2 = await prisma.post.create({
    data: {
      name: "Forum Rules",
      createdById: existingUser.id,
      categoryId: category2.id,
    },
  });

  const post3 = await prisma.post.create({
    data: {
      name: "How to get help",
      createdById: existingUser.id,
      categoryId: category3.id,
    },
  });

  // Create notifications for the posts
  await prisma.notification.create({
    data: {
      userId: existingUser.id,
      postId: post1.id,
      message: 'Your post "Welcome to the forum!" has been created!',
    },
  });

  await prisma.notification.create({
    data: {
      userId: existingUser.id,
      postId: post2.id,
      message: 'Your post "Forum Rules" has been created!',
      read: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: existingUser.id,
      postId: post3.id,
      message: 'Your post "How to get help" has been created!',
      read: false,
    },
  });

  console.log("Database has been seeded. 🌱");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
