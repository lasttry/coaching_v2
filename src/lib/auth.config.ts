import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma'; // Ensure this path matches your project structure

// Helper to encode a string as Uint8Array
function encode(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

// Helper to hash a password with salt using Web Crypto API
async function hashPassword(password: string, salt: string): Promise<string> {
  const passwordData = encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', passwordData);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export default {
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        // Validate the presence of credentials
        if (!credentials?.email || !credentials.password) {
          console.error('Missing credentials');
          return null;
        }
        console.log(`credentials: ${credentials}`);
        try {
          const email = String(credentials.email);
          const password = String(credentials.password);

          // Find the user in the database
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) {
            console.error('User not found');
            return null;
          }

          // Split the stored hash into salt and hashed password
          const [salt, storedHash] = user.password.split(':');
          if (!salt || !storedHash) {
            console.error('Stored password format is invalid');
            return null;
          }

          // Hash the provided password using the same salt
          const hashedPassword = await hashPassword(password, salt);

          // Verify the hashed password matches the stored hash
          if (hashedPassword !== storedHash) {
            console.error('Invalid password');
            return null;
          }

          // Return user object
          return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
          };
        } catch (error) {
          console.error('Error during user authorization:', error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id; // Add `id` to the token
      }
      return token;
    },
    session: async ({ session, token }) => {
      console.log(`session->token: ${token}`);
      console.log(`session->session: ${session}`);
      if (token) {
        session.user = {
          id: token.id as string, // Explicitly cast `id` to string
          name: session.user?.name || null,
          email: session.user?.email || '',
          emailVerified: new Date(),
        };
      }
      return session;
    },
    authorized: async ({ auth }) => {
      // Logged in users are authenticated, otherwise redirect to login page
      return !!auth;
    },
  },
  secret: process.env.AUTH_SECRET,
} satisfies NextAuthConfig;
