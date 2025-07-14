'use client';
import React, { ReactElement } from 'react';
import { Grid, Box } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
// components

const Dashboard = (): ReactElement => {
  return (
    <PageContainer title="Dashboard" description="this is Dashboard">
      <Box>
        <Grid container spacing={3}>
          <Grid
            size={{
              xs: 12,
              lg: 8,
            }}
          ></Grid>
          <Grid
            size={{
              xs: 12,
              lg: 4,
            }}
          >
            <Grid container spacing={3}>
              <Grid size={12}></Grid>
              <Grid size={12}></Grid>
            </Grid>
          </Grid>
          <Grid
            size={{
              xs: 12,
              lg: 4,
            }}
          ></Grid>
          <Grid
            size={{
              xs: 12,
              lg: 8,
            }}
          ></Grid>
          <Grid size={12}></Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default Dashboard;
