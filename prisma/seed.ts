import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Seed example user
  const hashedPassword = await hash("P@ssw0rd1!", 10);
  await prisma.user.delete({
    where: {
      email: 'user@diasantos.com',  // Replace with the specific email
    },
  });
  await prisma.user.create({
    data: {
      email: 'user@diasantos.com',
      name: 'Test User',
      image: 'https://example.com/user-image.png',
      password: hashedPassword, // Use a hashed password if possible
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
