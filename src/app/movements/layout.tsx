'use client';
import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { SettingsProvider } from '@/context/SettingsContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <SettingsProvider>{children}</SettingsProvider>
    </SessionProvider>
  );
}
