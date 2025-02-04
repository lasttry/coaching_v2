'use client';
import React, { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';

export default function RootLayout({ children }: { children: React.ReactNode }): ReactNode {
  return <SessionProvider>{children}</SessionProvider>;
}
