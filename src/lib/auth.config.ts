import { log } from '@/lib/logger';
import type { Account, NextAuthConfig, Profile, User } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import { PlatformRole } from '@prisma/client';
import { validatePassword } from './password';
import { mapClubToInterface } from '@/types/club/types';
import { Session } from 'next-auth';

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
          const selectedClubRelation = user.clubs.find((c) => c.clubId === user.defaultClubId);

          if (!selectedClubRelation || !selectedClubRelation.club) {
            log.error(
              `Default club (ID: ${user.defaultClubId}) not found or not included for user ${user.email}`
            );
            throw new Error('Default club configuration error');
          }

          const selectedClub = mapClubToInterface(selectedClubRelation.club);

          const userobj = {
            id: String(user.id),
            name: user.name,
            email: user.email,
            selectedClubId: user.defaultClubId,
            selectedSeason: selectedClub.season || '',
            club: selectedClub,
            role: user.role,
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
    jwt: async ({
      token,
      user,
      trigger,
      session,
    }: {
      token: JWT;
      user?: User | null;
      account?: Account | null;
      profile?: Profile | null;
      trigger?: 'update' | 'signIn' | 'signUp';
      isNewUser?: boolean;
      session?: Session | null;
    }): Promise<JWT> => {
      if (user) {
        token.id = user.id ?? '';
        token.name = user.name;
        token.email = user.email ?? '';
        token.role = user.role;
        token.selectedClubId = user.selectedClubId;
        token.club = user.club;
      }

      if (trigger === 'update' && session?.user) {
        token.selectedClubId = session.user.selectedClubId;
        token.club = session.user.club;
      }

      return token;
    },
    session: async ({ session, token }: { session: Session; token: JWT }): Promise<Session> => {
      session.user = {
        id: token.id,
        name: token.name ?? null,
        email: token.email ?? '',
        selectedClubId: token.selectedClubId,
        role: token.role as PlatformRole,
        club: token.club ?? undefined,
      };
      return session;
    },
    authorized: async ({ auth }) => {
      const isAuthorized = !!auth;
      return isAuthorized;
    },
  },
  secret: process.env.AUTH_SECRET,
} satisfies NextAuthConfig;
