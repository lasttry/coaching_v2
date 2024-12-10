import { PrismaClient } from "@prisma/client";
import { TextEncoder } from "util";

// Initialize Prisma Client
const prisma = new PrismaClient();

// Helper to encode a string as Uint8Array
function encode(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

// Helper to hash a password with salt using Web Crypto API
async function hashPassword(password: string, salt: string): Promise<string> {
  const passwordData = encode(password + salt);
  const hashBuffer = await crypto.subtle.digest("SHA-256", passwordData);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function generateSalt(length: number = 16): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function main() {
  // Generate a salt
  const salt = generateSalt(); // Replace with a securely generated salt in production

  // Hash the password
  const password = "admin123"; // Replace with desired password
  const hashedPassword = await hashPassword(password, salt);

    // Remove any existing user with the same email
  await prisma.user.deleteMany({
    where: { email: "admin@diasantos.com" },
  });
  // Store the user in the database
  await prisma.user.create({
    data: {
      name: "Admin User", // Replace with desired name
      email: "admin@diasantos.com", // Replace with desired email
      password: `${salt}:${hashedPassword}`, // Store salt and hash in the format `salt:hash`
    },
  });

  console.log("Admin user created:");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
