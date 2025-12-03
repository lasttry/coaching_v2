import NextAuth from 'next-auth';

const { handlers } = await (async () => {
  const { default: authConfig } = await import('@/lib/auth.config');
  return NextAuth(authConfig);
})();

export const { GET, POST } = handlers;
