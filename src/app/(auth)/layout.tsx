'use client';

import React, { ReactElement } from 'react';
import { Box, Container } from '@mui/material';
import { SessionProvider } from 'next-auth/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n.client';
import { I18nProvider } from '@/components/I18nProvider';

export default function AuthLayout({ children }: { children: React.ReactNode }): ReactElement {
  return (
    <SessionProvider>
      <I18nextProvider i18n={i18n}>
        <I18nProvider>
          <Box
            sx={{
              minHeight: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'grey.100',
            }}
          >
            <Container maxWidth="sm">{children}</Container>
          </Box>
        </I18nProvider>
      </I18nextProvider>
    </SessionProvider>
  );
}
