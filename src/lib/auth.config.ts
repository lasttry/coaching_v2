import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma'; // Ensure this path matches your project structure
import { PlatformRole } from '@prisma/client';
import { validatePassword } from './password';

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
          const user = await prisma.account.findUnique({
            where: { email },
            include: {
              clubs: {
                include: {
                  roles: true,
                  club: true, // Fetch club details
                },
              },
            },
          });

          if (!user) {
            console.error('User not found');
            return null;
          }

          const isPasswordValid = await validatePassword(
            password,
            user.password,
          );
          if (!isPasswordValid) {
            console.error('Invalid password');
            return null;
          }

          // Return user object
          const userobj = {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            selectedClubId: user.defaultClubId,
            role: user.role,
            clubs: user.clubs.map((accountClub) => ({
              clubId: accountClub.clubId,
              clubName: accountClub.club.name,
              roles: accountClub.roles.map((role) => role.role),
            })),
          };
          console.log(userobj);
          return userobj;
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
    jwt: async ({ token, user, session, trigger }) => {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.selectedClubId = user.selectedClubId;
        token.clubs = user.clubs; // Add role to JWT
      }
      if (trigger == 'update' && session) {
        token.selectedClubId = session.selectedClubId;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user = {
          id: token.id as string,
          name: token.name || null,
          email: token.email || '',
          emailVerified: new Date(),
          selectedClubId: token.selectedClubId as number,
          role: token.role as PlatformRole,
          clubs: token.clubs as {
            clubId: number;
            clubName: string;
            roles: string[];
          }[], // Include role in session
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
