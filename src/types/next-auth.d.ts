
declare module 'next-auth' {
  interface Session {
    user: {
      id: string; // Extend the session with user id
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string; // Extend the JWT with user id
  }
}