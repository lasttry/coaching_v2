import React, { useState, useEffect, ReactElement } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { log } from '@/lib/logger';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  AdminPanelSettings as AdminPanelSettingsIcon,
  Home as HomeIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Shield as ShieldIcon,
  SportsBasketball as SportsBasketballIcon,
  SwapHoriz as SwapHorizIcon,
  Translate as TranslateIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { AccountInterface } from '@/types/accounts/types';
import { ClubInterface } from '@/types/club/types';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n.client';

const getInitials = (name?: string | null): string => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const Profile = (): ReactElement => {
  const { t, i18n } = useTranslation();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [club, setClub] = useState<ClubInterface | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const { data: session } = useSession();
  const open = Boolean(anchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (): void => {
    setAnchorEl(null);
  };

  const handleLanguageChange = async (
    _event: React.MouseEvent<HTMLElement>,
    language: 'pt' | 'en' | null
  ): Promise<void> => {
    if (!language) return;
    await i18n.changeLanguage(language);
    localStorage.setItem('lng', language);
  };

  const handleLogout = async (): Promise<void> => {
    handleClose();
    await signOut();
  };

  useEffect(() => {
    const userId = session?.user?.id;
    const selectedClubId = session?.user?.selectedClubId;
    if (!userId || !selectedClubId) return;

    const controller = new AbortController();
    let active = true;

    const loadData = async (): Promise<void> => {
      try {
        const [accountRes, clubRes] = await Promise.all([
          fetch(`/api/accounts/${userId}`, { signal: controller.signal }),
          fetch(`/api/clubs/${selectedClubId}`, { signal: controller.signal }),
        ]);

        if (!active) return;

        if (accountRes.ok) {
          const accountData: AccountInterface = await accountRes.json();
          if (accountData.image) setPhotoPreview(accountData.image);
        }

        if (clubRes.ok) {
          const clubData: ClubInterface = await clubRes.json();
          setClub(clubData);
        }
      } catch (error) {
        if ((error as { name?: string } | undefined)?.name === 'AbortError') return;
        log.error('Error fetching profile menu data:', error);
      }
    };

    void loadData();

    return (): void => {
      active = false;
      controller.abort();
    };
  }, [session?.user?.id, session?.user?.selectedClubId]);

  const currentLanguage = i18n.language?.startsWith('pt') ? 'pt' : 'en';
  const role = session?.user?.role;
  const name = session?.user?.name;
  const email = session?.user?.email;

  return (
    <Box>
      <Tooltip title={name || t('profile.title')}>
        <IconButton
          size="large"
          aria-label="user menu"
          aria-controls={open ? 'profile-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleOpen}
          sx={{
            p: 0.5,
            ...(open && {
              outline: (theme) => `2px solid ${theme.palette.primary.main}`,
            }),
            borderRadius: '50%',
          }}
        >
          <Avatar
            src={photoPreview || undefined}
            alt={name || 'avatar'}
            sx={{
              width: 36,
              height: 36,
              bgcolor: 'primary.main',
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            {getInitials(name)}
          </Avatar>
        </IconButton>
      </Tooltip>

      <Menu
        id="profile-menu"
        anchorEl={anchorEl}
        keepMounted
        open={open}
        onClose={handleClose}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        slotProps={{
          paper: {
            elevation: 4,
            sx: {
              width: 320,
              maxWidth: '95vw',
              mt: 1,
              borderRadius: 2,
              overflow: 'hidden',
            },
          },
          list: {
            sx: { p: 0 },
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'primary.contrastText',
            p: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={photoPreview || undefined}
              alt={name || 'avatar'}
              sx={{
                width: 56,
                height: 56,
                border: (theme) => `3px solid ${theme.palette.common.white}`,
                bgcolor: 'background.paper',
                color: 'primary.main',
                fontWeight: 700,
                fontSize: 20,
              }}
            >
              {getInitials(name)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {name || t('common.loading')}
              </Typography>
              {email && (
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.85,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: 'block',
                  }}
                >
                  {email}
                </Typography>
              )}
              {role && (
                <Chip
                  size="small"
                  icon={
                    role === 'ADMIN' ? (
                      <AdminPanelSettingsIcon sx={{ fontSize: 14 }} />
                    ) : (
                      <ShieldIcon sx={{ fontSize: 14 }} />
                    )
                  }
                  label={role}
                  sx={{
                    mt: 0.5,
                    height: 22,
                    fontWeight: 700,
                    backgroundColor: 'rgba(255,255,255,0.22)',
                    color: 'primary.contrastText',
                    '& .MuiChip-icon': { color: 'primary.contrastText' },
                  }}
                />
              )}
            </Box>
          </Box>
        </Box>

        {/* Club */}
        {club && (
          <Paper
            elevation={0}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: 1.5,
              backgroundColor: 'action.hover',
              borderRadius: 0,
            }}
          >
            <Avatar
              src={club.image || undefined}
              alt={club.shortName || club.name || 'club'}
              sx={{ width: 36, height: 36, bgcolor: 'primary.light' }}
            >
              <SportsBasketballIcon fontSize="small" />
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 600, display: 'block', lineHeight: 1 }}
              >
                {t('profile.currentClub')}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {club.shortName || club.name}
              </Typography>
            </Box>
            <Tooltip title={t('club.switch')}>
              <IconButton
                size="small"
                component={Link}
                href="/utilities/chooseClub"
                onClick={handleClose}
              >
                <SwapHorizIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Paper>
        )}

        <Divider />

        {/* Quick links */}
        <MenuItem component={Link} href="/" onClick={handleClose} sx={{ py: 1.25, gap: 1.5 }}>
          <HomeIcon fontSize="small" color="primary" />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {t('home.title')}
          </Typography>
        </MenuItem>
        <MenuItem
          component={Link}
          href="/utilities/profile"
          onClick={handleClose}
          sx={{ py: 1.25, gap: 1.5 }}
        >
          <PersonIcon fontSize="small" color="primary" />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {t('profile.my')}
          </Typography>
        </MenuItem>

        <Divider />

        {/* Language */}
        <Box sx={{ p: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <TranslateIcon fontSize="small" color="action" />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}
            >
              {t('profile.language')}
            </Typography>
          </Box>
          <ToggleButtonGroup
            value={currentLanguage}
            exclusive
            onChange={handleLanguageChange}
            size="small"
            fullWidth
            color="primary"
          >
            <ToggleButton value="pt" sx={{ textTransform: 'none', fontWeight: 600 }}>
              {t('profile.languagePortuguese')}
            </ToggleButton>
            <ToggleButton value="en" sx={{ textTransform: 'none', fontWeight: 600 }}>
              {t('profile.languageEnglish')}
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Divider />

        {/* Logout */}
        <Box sx={{ p: 1.5 }}>
          <Button
            onClick={() => void handleLogout()}
            variant="contained"
            color="error"
            fullWidth
            startIcon={<LogoutIcon />}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            {t('profile.logout')}
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};

export default Profile;
