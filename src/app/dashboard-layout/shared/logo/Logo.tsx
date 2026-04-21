import React, { useState, useEffect, ReactElement, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ClubInterface } from '@/types/club/types';
import { log } from '@/lib/logger';
import { useTranslation } from 'react-i18next';

const Logo = (): ReactElement => {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const router = useRouter();
  const [club, setClub] = useState<ClubInterface | null>(null);
  const [hasMultipleClubs, setHasMultipleClubs] = useState(false);

  // Keep the latest `t` without re-running the data-loading effect when i18n re-renders.
  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  }, [t]);

  const email = session?.user?.email ?? null;
  const selectedClubId = session?.user?.selectedClubId ?? null;

  useEffect(() => {
    if (!email) {
      log.warn(tRef.current('account.emailMissing'));
      return;
    }

    const controller = new AbortController();
    let active = true;

    const fetchAccountData = async (): Promise<void> => {
      try {
        const response = await fetch(`/api/accounts?email=${encodeURIComponent(email)}`, {
          signal: controller.signal,
        });
        const data = await response.json();
        if (!active || controller.signal.aborted) return;

        if (!response.ok) {
          const errorText = data?.error || 'Failed to fetch account data';
          log.error(errorText);
          return;
        }

        if (data[0]?.clubs?.length > 1) {
          setHasMultipleClubs(true);
        }

        if (selectedClubId) {
          const clubResponse = await fetch(`/api/clubs/${selectedClubId}`, {
            signal: controller.signal,
          });
          const clubData = await clubResponse.json();
          if (!active || controller.signal.aborted) return;

          if (clubResponse.ok) {
            setClub(clubData);
          } else {
            const clubErrorText = `Failed to fetch club data: ${clubData.error || 'Unknown error'}`;
            log.error(clubErrorText);
          }
        }
      } catch (error) {
        if ((error as { name?: string } | undefined)?.name === 'AbortError') return;
        const errorText =
          error instanceof Error
            ? `Error fetching account or club data: ${error.message}`
            : 'An unknown error occurred while fetching account or club data.';
        log.error(errorText);
      }
    };

    void fetchAccountData();

    return (): void => {
      active = false;
      controller.abort();
    };
  }, [email, selectedClubId]);

  if (!club) {
    return (
      <Typography variant="body1" sx={{ color: (theme) => theme.palette.text.secondary }}>
        Loading club information...
      </Typography>
    );
  }

  const handleClick = (): void => {
    if (hasMultipleClubs) {
      router.push('/utilities/chooseClub');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
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
