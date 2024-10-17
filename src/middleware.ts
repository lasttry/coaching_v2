import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/auth/signin',  // Custom sign-in page
  },
});

export const config = {
  matcher: ['/((?!auth).*)'],  // Protect all routes except those in /auth
};
