import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { ClubInterface } from '@/types/club/types';

const Logo = () => {
  const { data: session } = useSession();
  const [club, setClub] = useState<ClubInterface | null>(null);

  // Fetch settings when the component mounts
  useEffect(() => {
    async function fetchClub() {
      try {
        if (!session?.user.selectedClubId) return;
        const response = await fetch(
          `/api/clubs/${session?.user.selectedClubId}`,
        );
        const data = await response.json();
        if (response.ok) {
          setClub(data); // Set the settings data
        } else {
          console.log(data.error);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    }

    fetchClub();
  }, [session]);

  // Show a placeholder if the settings data isn't loaded yet
  if (!club) {
    return null;
  }

  return (
    <Box display="flex" alignItems="center" sx={{ paddingTop: '20px' }}>
      {/* Use the image from settings or default */}
      <Image
        src={club.image || '/images/logos/logo-dark.svg'} // Fallback to default if no image is set
        alt={club.shortName || 'logo'} // Use shortName or fallback to "logo"
        height={50}
        width={50}
        priority
      />
      {/* Display the shortName next to the logo */}
      <Typography variant="h6" sx={{ ml: 2, fontWeight: 'bold' }}>
        {club.shortName || 'Short Name'}
      </Typography>
    </Box>
  );
};

export default Logo;
