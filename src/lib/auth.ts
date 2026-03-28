import NextAuth from 'next-auth';
import authConfig from './auth.config';
import { log } from './logger';

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  logger: {
    error: (error) => {
      if (error.name === 'CredentialsSignin') return;
      log.error('[auth]', error);
    },
    warn: (code) => {
      log.warn('[auth]', code);
    },
    debug: () => {
      // Suppress debug logs
    },
  },
  ...authConfig,
});
