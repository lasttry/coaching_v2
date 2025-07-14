import { log } from '@/lib/logger';
import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import { PlatformRole } from '@prisma/client';
import { validatePassword } from './password';
import { UserInterface } from '@/types/user';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default {
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials.password) {
          log.error('Missing credentials');
          throw new Error('Credentials are required');
        }
        try {
          const email = String(credentials.email);
          const password = String(credentials.password);

          if (!emailRegex.test(email)) {
            log.warn(`Invalid email format: ${email}`);
            throw new Error('Invalid email format');
          }
          if (password.length < 8) {
            log.warn('Password is too short');
            throw new Error('Password must be at least 8 characters long');
          }

          const user = await prisma.account.findUnique({
            where: { email },
            include: {
              clubs: {
                include: {
                  roles: true,
                  club: true,
                },
              },
            },
          });

          if (!user) {
            log.error('User not found for email:', { email });
            throw new Error('User not found');
          }

          const isPasswordValid = await validatePassword(password, user.password);
          if (!isPasswordValid) {
            log.error('Invalid password for email:', { email });
            throw new Error('Invalid password');
          }
          const selectedClub = user.clubs.find((club) => club.clubId === user.defaultClubId);
          const userobj: UserInterface = {
            id: user.id,
            name: user.name,
            email: user.email,
            selectedClubId: user.defaultClubId,
            selectedSeason: selectedClub?.club?.season || '',
            role: user.role
          };
          return userobj;
        } catch (error: unknown) {
          if (error instanceof Error) {
            log.error(`Error during user authorization: ${error.message}`, { error });
          } else {
            log.error('Unknown error during user authorization', { error });
          }
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
      }
      if (trigger === 'update' && session) {
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
        };
      }
      return session;
    },
    authorized: async ({ auth }) => {
      const isAuthorized = !!auth;
      return isAuthorized;
    },
  },
  secret: process.env.AUTH_SECRET,
} satisfies NextAuthConfig;
