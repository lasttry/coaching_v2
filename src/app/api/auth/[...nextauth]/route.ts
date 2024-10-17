import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/prisma/client';  // Adjust this path to your prisma client location
import { compare } from 'bcryptjs';  // For comparing hashed passwords

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing credentials');
        }

        // Find user in the database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error('No user found');
        }

        // Compare passwords
        const isValidPassword = await compare(credentials.password, user.password);
        if (!isValidPassword) {
          throw new Error('Invalid password');
        }

        return { id: user.id, name: user.name, email: user.email, image: user.image };
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',  // Custom sign-in page
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      return session;
    },
  },
  adapter: PrismaAdapter(prisma),  // Adapter for Prisma
};

// Export GET and POST handlers
export const GET = NextAuth(authOptions);
export const POST = NextAuth(authOptions);
