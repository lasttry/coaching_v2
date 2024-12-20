import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import Image from 'next/image';

import { Settings } from '@/types/settings/types';

const Logo = () => {
  const [settings, setSettings] = useState<Settings | null>(null);

  // Fetch settings when the component mounts
  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data: Settings = await response.json();
          setSettings(data); // Set the settings data
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    }

    fetchSettings();
  }, []);

  // Show a placeholder if the settings data isn't loaded yet
  if (!settings) {
    return null;
  }

  return (
    <Box display="flex" alignItems="center" sx={{ paddingTop: '20px' }}>
      {/* Use the image from settings or default */}
      <Image
        src={settings.image || '/images/logos/logo-dark.svg'} // Fallback to default if no image is set
        alt={settings.shortName || 'logo'} // Use shortName or fallback to "logo"
        height={50}
        width={50}
        priority
      />
      {/* Display the shortName next to the logo */}
      <Typography variant="h6" sx={{ ml: 2, fontWeight: 'bold' }}>
        {settings.shortName || 'Short Name'}
      </Typography>
    </Box>
  );
};

export default Logo;
