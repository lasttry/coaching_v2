import { log } from '@/lib/logger';
import type { Account, NextAuthConfig, Profile, User } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import { PlatformRole } from '@prisma/client';
import { validatePassword } from './password';
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
          log.warn('Login attempt with missing credentials');
          return null;
        }

        const email = String(credentials.email);
        const password = String(credentials.password);

        if (!emailRegex.test(email)) {
          log.warn('Login attempt with invalid email format');
          return null;
        }

        if (password.length < 8) {
          log.warn('Login attempt with password too short');
          return null;
        }

        try {
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
            log.warn('Login failed: user not found');
            return null;
          }

          const isPasswordValid = await validatePassword(password, user.password);
          if (!isPasswordValid) {
            log.warn('Login failed: invalid password');
            return null;
          }

          const selectedClubRelation = user.clubs.find((c) => c.clubId === user.defaultClubId);
          if (!selectedClubRelation || !selectedClubRelation.club) {
            log.warn('Login failed: default club not configured');
            return null;
          }

          const currentSeason = await prisma.season.findFirst({
            where: { isCurrent: true },
            orderBy: { startDate: 'desc' },
          });

          return {
            id: String(user.id),
            name: user.name,
            email: user.email,
            selectedClubId: user.defaultClubId,
            selectedSeasonId: currentSeason?.id,
            role: user.role,
          };
        } catch (error) {
          log.error('Unexpected error during login:', error);
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
        token.selectedSeasonId = user.selectedSeasonId;
      }

      if (trigger === 'update' && session?.user) {
        token.selectedClubId = session.user.selectedClubId;
        token.selectedSeasonId = session.user.selectedSeasonId;
      }

      return token;
    },
    session: async ({ session, token }: { session: Session; token: JWT }): Promise<Session> => {
      session.user = {
        id: token.id,
        name: token.name ?? null,
        email: token.email ?? '',
        selectedClubId: token.selectedClubId,
        selectedSeasonId: token.selectedSeasonId,
        role: token.role as PlatformRole,
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
