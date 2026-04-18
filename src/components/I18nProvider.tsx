'use client';

import React, { ReactElement, ReactNode } from 'react';
import '@/lib/i18n.client'; // Ensures i18n is initialized

interface I18nProviderProps {
  children: ReactNode;
}

// Simple wrapper - i18n is now initialized synchronously
export const I18nProvider = ({ children }: I18nProviderProps): ReactElement => {
  return <>{children}</>;
};
