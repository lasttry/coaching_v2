/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';
import { AdapterUser } from '@auth/core/adapters';
import { PlatformRole } from '@prisma/client';
import { ClubInterface } from './club/types';

// -------------------------
// next-auth augmentation
// -------------------------
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string | null;
      email: string;
      selectedClubId?: number | null;
      role: PlatformRole;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    id: string;
    name: string | null;
    email: string;
    selectedClubId?: number | null;
    selectedSeasonId?: number | null;
    role: PlatformRole;
  }
}

// -------------------------
// next-auth/jwt augmentation
// -------------------------
declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    name?: string | null;
    email?: string;
    selectedClubId?: number | null;
    selectedSeasonId?: number | null;
    role: PlatformRole;
  }
}

// -------------------------
// adapter augmentation
// -------------------------
declare module '@auth/core/adapters' {
  interface AdapterUser {
    id: string;
    name: string | null;
    email: string;
    selectedClubId?: number | null;
    role: PlatformRole;
  }
}
