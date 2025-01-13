import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ClubInterface } from '@/types/club/types';
import { log } from '@/lib/logger';

const Logo = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [club, setClub] = useState<ClubInterface | null>(null);
  const [hasMultipleClubs, setHasMultipleClubs] = useState(false);

  useEffect(() => {
    async function fetchAccountData() {
      try {
        if (!session?.user?.email) {
          log.warn('User email is missing in the session.');
          return;
        }

        log.info('Fetching account data for email:', session.user.email);
        const response = await fetch(
          `/api/accounts?email=${encodeURIComponent(session.user.email)}`,
        );
        const data = await response.json();

        if (!response.ok) {
          const errorText = data?.error || 'Failed to fetch account data';
          log.error(errorText);
          return;
        }

        log.info('Account data fetched successfully:', data);

        if (data[0]?.clubs?.length > 1) {
          log.info('User has multiple clubs.');
          setHasMultipleClubs(true);
        } else {
          log.info('User has a single club.');
        }

        // Fetch the selected club data
        if (session.user.selectedClubId) {
          const clubResponse = await fetch(
            `/api/clubs/${session.user.selectedClubId}`,
          );
          const clubData = await clubResponse.json();

          if (clubResponse.ok) {
            log.info('Club data fetched successfully:', clubData);
            setClub(clubData);
          } else {
            const clubErrorText = `Failed to fetch club data: ${clubData.error || 'Unknown error'}`;
            log.error(clubErrorText);
          }
        }
      } catch (error) {
        let errorText: string;

        if (error instanceof Error) {
          // If the error is an instance of Error, use its message
          errorText = `Error fetching account or club data: ${error.message}`;
        } else {
          // Fallback for non-Error objects
          errorText = 'An unknown error occurred while fetching account or club data.';
        }

        log.error(errorText);
      }
    }

    fetchAccountData();
  }, [session]);

  if (!club) {
    return (
      <Typography
        variant="body1"
        sx={{ color: (theme) => theme.palette.text.secondary }}
      >
        Loading club information...
      </Typography>
    );
  }

  const handleClick = () => {
    if (hasMultipleClubs) {
      router.push('/utilities/chooseClub');
    }
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      sx={{
        paddingTop: '20px',
        cursor: hasMultipleClubs ? 'pointer' : 'default',
      }}
      onClick={handleClick}
    >
      <Image
        src={club.image || '/images/logos/logo-dark.svg'}
        alt={club.shortName || 'logo'}
        height={50}
        width={50}
        priority
      />
      <Typography variant="h6" sx={{ ml: 2, fontWeight: 'bold' }}>
        {club.shortName || 'Club Name'}
      </Typography>
    </Box>
  );
};

export default Logo;
