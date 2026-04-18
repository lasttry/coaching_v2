'use client';
import React, { ReactElement } from 'react';
import { Typography } from '@mui/material';
import PageContainer from '@/app/components/container/PageContainer';
import DashboardCard from '@/app/components/shared/DashboardCard';

const SamplePage = (): ReactElement => {
  return (
    <PageContainer title="Sample Page" description="this is Sample page">
      <DashboardCard title="Sample Page">
        <Typography>This is a sample page</Typography>
      </DashboardCard>
    </PageContainer>
  );
};

export default SamplePage;
