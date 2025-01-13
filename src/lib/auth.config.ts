import { log } from '@/lib/logger';
import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
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
        if (!credentials?.email || !credentials.password) {
          log.error('Missing credentials');
          throw new Error('Credentials are required');
        }

        log.info(`Attempting to authorize user with email: ${credentials.email}`);

        try {
          const email = String(credentials.email);
          const password = String(credentials.password);

          if (!email.includes('@')) {
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

          log.info(`User authorized successfully: ${user.email}`);
          return userobj;
        } catch (error) {
          log.error('Error during user authorization:', { error });
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
      log.debug('JWT callback triggered', { token, trigger });

      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.selectedClubId = user.selectedClubId;
        token.clubs = user.clubs;
      }
      if (trigger === 'update' && session) {
        token.selectedClubId = session.selectedClubId;
      }

      log.debug('Updated JWT token:', token);
      return token;
    },
    session: async ({ session, token }) => {
      log.debug('Session callback triggered', { session, token });

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
          }[],
        };
      }

      log.debug('Updated session:', { session });
      return session;
    },
    authorized: async ({ auth }) => {
      const isAuthorized = !!auth;
      log.info('Authorization callback triggered:', { isAuthorized });
      return isAuthorized;
    },
  },
  secret: process.env.AUTH_SECRET,
} satisfies NextAuthConfig;
