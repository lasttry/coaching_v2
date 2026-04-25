'use client';

import React, { ReactElement, useState } from 'react';
import { baselightTheme } from '@/utils/theme/DefaultColors';
import { ThemeProvider } from '@mui/material/styles';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { styled, Container, Box, useMediaQuery, useTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { SessionProvider } from 'next-auth/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n.client';
import { I18nProvider } from '@/components/I18nProvider';
import { QueryProvider } from '@/components/QueryProvider';
import Header from '@/app/dashboard-layout/header/Header';
import Sidebar from '@/app/dashboard-layout/sidebar/Sidebar';
import ErrorBoundary from '@/app/components/shared/ErrorBoundary';
import { log } from '@/lib/logger';

// Styled Components - with responsive padding
const MainWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  minHeight: '100vh',
  width: '100%',
  padding: '20px',
  [theme.breakpoints.down('lg')]: {
    padding: '10px',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '0',
  },
}));

const PageWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  flexGrow: 1,
  paddingBottom: '60px',
  flexDirection: 'column',
  zIndex: 1,
  backgroundColor: 'transparent',
  [theme.breakpoints.down('sm')]: {
    paddingBottom: '20px',
  },
}));

export default function RootLayout({ children }: { children: React.ReactNode }): ReactElement {
  const [isSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!children) {
    log.error('RootLayout: children prop is missing');
    throw new Error('The "children" prop is required and cannot be null or undefined.');
  }

  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider options={{ key: 'mui', prepend: true }}>
          <ThemeProvider theme={baselightTheme}>
            <CssBaseline />
            <SessionProvider>
              <QueryProvider>
                <I18nextProvider i18n={i18n}>
                  <I18nProvider>
                    <MainWrapper className="mainwrapper">
                      <Sidebar
                        isSidebarOpen={isSidebarOpen}
                        isMobileSidebarOpen={isMobileSidebarOpen}
                        onSidebarClose={() => setMobileSidebarOpen(false)}
                      />
                      <PageWrapper className="page-wrapper">
                        <Container
                          sx={{
                            maxWidth: { xs: '100%', sm: '100%', md: '1300px' },
                            px: { xs: 1, sm: 2, md: 3 },
                          }}
                          disableGutters={isMobile}
                        >
                          <Header toggleMobileSidebar={() => setMobileSidebarOpen(true)} />
                          <Box
                            sx={{ minHeight: 'calc(100vh - 170px)', py: { xs: 1, sm: 2, md: 3 } }}
                          >
                            <ErrorBoundary>{children}</ErrorBoundary>
                          </Box>
                        </Container>
                      </PageWrapper>
                    </MainWrapper>
                  </I18nProvider>
                </I18nextProvider>
              </QueryProvider>
            </SessionProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
