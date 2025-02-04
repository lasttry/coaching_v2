'use client';

import { styled, Container, Box } from '@mui/material';
import React, { useState } from 'react';
import Header from '@/app/(DashboardLayout)/layout/header/Header';
import Sidebar from '@/app/(DashboardLayout)/layout/sidebar/Sidebar';
import { SessionProvider } from 'next-auth/react';
import { SettingsProvider } from '@/context/SettingsContext';
import { log } from '@/lib/logger'; // Import the logger
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';

// Log initialization
log.info('RootLayout component initialized');

// Styled Components
const MainWrapper = styled('div')(() => ({
  display: 'flex',
  minHeight: '100vh',
  width: '100%',
  padding: '20px',
}));

const PageWrapper = styled('div')(() => ({
  display: 'flex',
  flexGrow: 1,
  paddingBottom: '60px',
  flexDirection: 'column',
  zIndex: 1,
  backgroundColor: 'transparent',
}));

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Assert children prop
  if (!children) {
    log.error('RootLayout: children prop is missing');
    throw new Error('The "children" prop is required and cannot be null or undefined.');
  }

  // Logging the state values
  log.info(`Sidebar state: isSidebarOpen=${isSidebarOpen}, isMobileSidebarOpen=${isMobileSidebarOpen}`);

  return (
    <SessionProvider>
      <I18nextProvider i18n={i18n}>
        <MainWrapper className="mainwrapper">
          {/* Sidebar */}
          <Sidebar
            isSidebarOpen={isSidebarOpen}
            isMobileSidebarOpen={isMobileSidebarOpen}
            onSidebarClose={() => {
              log.info('Closing mobile sidebar');
              setMobileSidebarOpen(false);
            }}
          />

          {/* Main Wrapper */}
          <PageWrapper className="page-wrapper">
            <Container
              sx={{
                maxWidth: '1300px !important',
              }}
            >
              {/* Header */}
              <Header
                toggleMobileSidebar={() => {
                  log.info('Opening mobile sidebar');
                  setMobileSidebarOpen(true);
                }}
              />

              {/* Page Route */}
              <Box sx={{ minHeight: 'calc(100vh - 170px)', py: 3 }}>
                <SettingsProvider>{children}</SettingsProvider>
              </Box>
            </Container>
          </PageWrapper>
        </MainWrapper>
      </I18nextProvider>
    </SessionProvider>
  );
}
