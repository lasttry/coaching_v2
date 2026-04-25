import React, { useState, useEffect, ReactElement, useRef } from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ClubInterface } from '@/types/club/types';
import { log } from '@/lib/logger';
import { useTranslation } from 'react-i18next';
import HomeIcon from '@mui/icons-material/Home';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import IconButton from '@mui/material/IconButton';

const Logo = (): ReactElement => {
  const { t } = useTranslation();
  const { data: session, status } = useSession();
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
    if (status === 'loading') return;
    if (!email) {
      if (status === 'authenticated') {
        log.warn(tRef.current('account.emailMissing'));
      }
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
  }, [email, selectedClubId, status]);

  if (!selectedClubId) {
    return (
      <Box
        onClick={() => router.push('/utilities/chooseClub')}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          paddingTop: '20px',
          cursor: 'pointer',
          borderRadius: 1,
          p: 0.5,
          '&:hover': { backgroundColor: 'action.hover' },
        }}
      >
        <Image src="/images/logos/logo-dark.svg" alt="logo" height={50} width={50} priority />
        <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {t('chooseClub.title')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t('chooseClub.pickOneHint')}
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!club) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, paddingTop: '20px', p: 0.5 }}>
        <Box
          sx={{
            width: 50,
            height: 50,
            borderRadius: 1,
            backgroundColor: 'action.hover',
          }}
        />
        <Typography variant="body2" color="text.secondary">
          {t('common.loading')}
        </Typography>
      </Box>
    );
  }

  const handleGoHome = (): void => {
    router.push('/');
  };

  const handleSwitchClub = (e: React.MouseEvent): void => {
    e.stopPropagation();
    router.push('/utilities/chooseClub');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        paddingTop: '20px',
      }}
    >
      <Tooltip title={t('home.goTo')} placement="right">
        <Box
          onClick={handleGoHome}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            cursor: 'pointer',
            flex: 1,
            minWidth: 0,
            borderRadius: 1,
            p: 0.5,
            transition: 'background-color 0.2s',
            '&:hover': {
              backgroundColor: 'action.hover',
              '& .home-badge': { opacity: 1 },
            },
          }}
        >
          <Image
            src={club.image || '/images/logos/logo-dark.svg'}
            alt={club.shortName || 'logo'}
            height={50}
            width={50}
            priority
          />
          <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: 1.2,
              }}
            >
              {club.shortName || 'Club Name'}
            </Typography>
            <Box
              className="home-badge"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                color: 'primary.main',
                opacity: 0.7,
                transition: 'opacity 0.2s',
              }}
            >
              <HomeIcon sx={{ fontSize: 14 }} />
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {t('home.title')}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Tooltip>
      {hasMultipleClubs && (
        <Tooltip title={t('club.switch')}>
          <IconButton size="small" onClick={handleSwitchClub} sx={{ flexShrink: 0 }}>
            <SwapHorizIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

export default Logo;
