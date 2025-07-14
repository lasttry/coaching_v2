/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';
import { AdapterUser } from '@auth/core/adapters'; // Ensure it's imported from the correct source
import { AccountPlatformRole } from './accounts/types';
import { PlatformRole } from '@prisma/client';
import { ClubInterface } from './club/types';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string | null;
      email: string;
      selectedClubId?: number;
      role: PlatformRole | undefined;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role: PlatformRole | undefined;
    selectedClubId?: number;
  }
}

declare module '@auth/core/adapters' {
  interface AdapterUser {
    role: PlatformRole | undefined;
    selectedClubId?: number;
  }
}
