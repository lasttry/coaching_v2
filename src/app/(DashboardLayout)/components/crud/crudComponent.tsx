'use client';

import { Box, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface CRUDProps {
  childInterface: React.ComponentType;
}

const CRUDComponent: React.FC<CRUDProps> = <T extends Record<string, any>>({ childInterface }) => {
  const { t } = useTranslation();

  return (
    <>
      <Box sx={{ padding: 2 }}>
        <Typography variant="h5" gutterBottom>
          Entity Details
        </Typography>
        {childInterface
          ? 'No interface selected'
          : Object.entries(childInterface).map(([key, value]) => (
              <Box key={key} sx={{ marginBottom: 1 }}>
                <Typography variant="subtitle2">{key}:</Typography>
                <Typography variant="body1">
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </Typography>
              </Box>
            ))}
      </Box>
    </>
  );
};

CRUDComponent.displayName = 'CRUD Component';
export default CRUDComponent;
