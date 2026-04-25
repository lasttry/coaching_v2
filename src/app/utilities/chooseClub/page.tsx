'use client';

import React, { ReactElement, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  FormControlLabel,
  Grid,
  Skeleton,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  ClearAll as ClearAllIcon,
  LoginRounded as LoginRoundedIcon,
  SportsBasketball as SportsBasketballIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n.client';
import PageContainer from '@/app/components/container/PageContainer';
import DashboardCard from '@/app/components/shared/DashboardCard';
import { log } from '@/lib/logger';
import { useClearDefaultClub, useMyClubs, useSetDefaultClub } from '@/hooks/useMyClubs';
import type { MyClub } from '@/app/api/accounts/me/clubs/route';

const ROLE_COLOR: Record<
  string,
  'default' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error'
> = {
  ADMIN: 'error',
  DIRECTOR: 'warning',
  COACH: 'primary',
  PLAYER: 'info',
  PARENT: 'secondary',
  TEAM_MANAGER: 'success',
};

const ChooseClubPage = (): ReactElement => {
  const { t } = useTranslation();
  const { update } = useSession();
  const router = useRouter();

  const { data, isLoading, error } = useMyClubs();
  const setDefault = useSetDefaultClub();
  const clearDefault = useClearDefaultClub();

  const [setAsDefault, setSetAsDefault] = useState(false);
  const [selecting, setSelecting] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const clubs = data?.clubs ?? [];
  const hasDefault = (data?.defaultClubId ?? 0) > 0;

  const handleSelectClub = async (club: MyClub): Promise<void> => {
    setErrorMessage(null);
    setSelecting(club.id);
    try {
      if (setAsDefault && !club.isDefault) {
        await setDefault.mutateAsync(club.id);
      }
      await update({ selectedClubId: club.id });
      router.push('/');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      log.error('Failed to select club:', msg);
      setErrorMessage(msg);
      setSelecting(null);
    }
  };

  const handleClearDefault = async (): Promise<void> => {
    setErrorMessage(null);
    try {
      await clearDefault.mutateAsync();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      log.error('Failed to clear default club:', msg);
      setErrorMessage(msg);
    }
  };

  const renderSkeleton = (): ReactElement => (
    <Grid container spacing={2}>
      {[0, 1, 2, 3].map((i) => (
        <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <Skeleton variant="rounded" height={220} />
        </Grid>
      ))}
    </Grid>
  );

  const renderEmpty = (): ReactElement => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 6,
        gap: 2,
      }}
    >
      <SportsBasketballIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
      <Typography variant="h6" color="text.secondary">
        {t('chooseClub.empty.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {t('chooseClub.empty.description')}
      </Typography>
    </Box>
  );

  const renderClubCard = (club: MyClub): ReactElement => {
    const isSelecting = selecting === club.id;
    const bg = club.backgroundColor || '#1976d2';
    const fg = club.foregroundColor || '#ffffff';

    return (
      <Card
        elevation={club.isDefault ? 8 : 3}
        sx={{
          position: 'relative',
          height: '100%',
          overflow: 'hidden',
          border: club.isDefault ? '2px solid' : '1px solid',
          borderColor: club.isDefault ? 'primary.main' : 'divider',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 8,
          },
        }}
      >
        {club.isDefault && (
          <Chip
            size="small"
            icon={<StarIcon sx={{ fontSize: 14 }} />}
            label={t('chooseClub.defaultBadge')}
            color="primary"
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              fontWeight: 700,
              zIndex: 2,
            }}
          />
        )}
        <CardActionArea
          onClick={() => void handleSelectClub(club)}
          disabled={isSelecting}
          sx={{ height: '100%' }}
        >
          <Box
            sx={{
              height: 100,
              background: club.image
                ? `linear-gradient(135deg, ${bg}ee 0%, ${bg}88 100%), url(${club.image}) center/cover`
                : `linear-gradient(135deg, ${bg} 0%, ${bg}cc 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <Avatar
              src={club.image || undefined}
              alt={club.shortName || club.name}
              sx={{
                width: 72,
                height: 72,
                border: `3px solid ${fg}`,
                bgcolor: 'background.paper',
                color: bg,
                fontWeight: 700,
                fontSize: 24,
              }}
            >
              <SportsBasketballIcon />
            </Avatar>
          </Box>
          <CardContent sx={{ pt: 2 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                textAlign: 'center',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {club.shortName || club.name}
            </Typography>
            {club.shortName && club.shortName !== club.name && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: 'block',
                  textAlign: 'center',
                  mb: 1,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {club.name}
              </Typography>
            )}
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 0.5,
                justifyContent: 'center',
                mt: 1,
                minHeight: 24,
              }}
            >
              {club.roles.length === 0 ? (
                <Typography variant="caption" color="text.disabled">
                  {t('chooseClub.noRoles')}
                </Typography>
              ) : (
                club.roles.map((role) => (
                  <Chip
                    key={role}
                    size="small"
                    label={t(`roles.${role}`, role)}
                    color={ROLE_COLOR[role] ?? 'default'}
                    variant="outlined"
                    sx={{ height: 22, fontWeight: 600 }}
                  />
                ))
              )}
            </Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                mt: 2,
                color: 'primary.main',
                fontWeight: 600,
              }}
            >
              {isSelecting ? <CircularProgress size={18} /> : <LoginRoundedIcon fontSize="small" />}
              <Typography variant="button" sx={{ lineHeight: 1 }}>
                {isSelecting ? t('common.loading') : t('chooseClub.enter')}
              </Typography>
            </Box>
          </CardContent>
        </CardActionArea>
      </Card>
    );
  };

  return (
    <PageContainer title={t('chooseClub.title')} description={t('chooseClub.description')}>
      <DashboardCard
        title={t('chooseClub.title')}
        subtitle={t('chooseClub.subtitle')}
        action={
          hasDefault ? (
            <Tooltip title={t('chooseClub.clearDefaultHint')}>
              <span>
                <Button
                  size="small"
                  color="warning"
                  variant="outlined"
                  startIcon={<ClearAllIcon />}
                  onClick={() => void handleClearDefault()}
                  disabled={clearDefault.isPending}
                >
                  {t('chooseClub.clearDefault')}
                </Button>
              </span>
            </Tooltip>
          ) : undefined
        }
      >
        <Stack spacing={2}>
          {!hasDefault && (
            <Alert severity="info" icon={<StarBorderIcon />} variant="outlined">
              {t('chooseClub.noDefaultAlert')}
            </Alert>
          )}

          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
          {error && <Alert severity="error">{(error as Error).message}</Alert>}

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              flexWrap: 'wrap',
              p: 1.5,
              borderRadius: 1,
              backgroundColor: 'action.hover',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {setAsDefault ? (
                <CheckCircleIcon color="primary" />
              ) : (
                <StarBorderIcon color="action" />
              )}
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {t('chooseClub.setAsDefault.title')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('chooseClub.setAsDefault.hint')}
                </Typography>
              </Box>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={setAsDefault}
                  onChange={(e) => setSetAsDefault(e.target.checked)}
                  color="primary"
                />
              }
              label=""
              sx={{ m: 0 }}
            />
          </Box>

          {isLoading ? (
            renderSkeleton()
          ) : clubs.length === 0 ? (
            renderEmpty()
          ) : (
            <Grid container spacing={2}>
              {clubs.map((club) => (
                <Grid key={club.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  {renderClubCard(club)}
                </Grid>
              ))}
            </Grid>
          )}
        </Stack>
      </DashboardCard>
    </PageContainer>
  );
};

export default ChooseClubPage;
