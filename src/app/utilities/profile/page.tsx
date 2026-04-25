'use client';
import React, { ReactElement } from 'react';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { TextField, Button, Typography, Stack, Box, Avatar } from '@mui/material';
import { AccountInterface } from '@/types/accounts/types';
import { log } from '@/lib/logger';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n.client';
import { useAccount, useUpdateAccount } from '@/hooks/useAccounts';

const ProfilePage = (): ReactElement => {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const userId = session?.user?.id ? Number(session.user.id) : null;

  const [userDetails, setUserDetails] = useState<AccountInterface>({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    password: '',
    confirmPassword: '',
    image: '',
    defaultClubId: 0,
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userClubs, setUserClubs] = useState<{ id: number; name: string }[]>([]);
  const [defaultClubId, setDefaultClubId] = useState<number>(0);

  const { data: profileData, error: profileError } = useAccount(userId);
  const updateAccountMutation = useUpdateAccount();

  useEffect(() => {
    if (profileData) {
      setUserDetails((prev) => ({
        ...prev,
        ...profileData,
      }));
      if (profileData.image) {
        setPhotoPreview(`data:image/png;base64,${profileData.image}`);
      }
      const clubs = (profileData as AccountInterface & { clubs?: { id: number; name: string }[] })
        .clubs;
      if (clubs) {
        setUserClubs(clubs);
        if (clubs.length === 1) {
          setDefaultClubId(clubs[0].id);
        }
      }
    }
  }, [profileData]);

  useEffect(() => {
    if (profileError) {
      log.error('Error fetching profile:', profileError);
      setError(
        profileError instanceof Error ? profileError.message : t('profile.fetchNetworkError')
      );
    }
  }, [profileError, t]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setUserDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        setUserDetails((prev) => ({
          ...prev,
          image: base64String.split(',')[1],
        }));
        setPhotoPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!userId) return;

    const resolvedDefaultClubId =
      defaultClubId === 0 && userClubs.length > 0 ? userClubs[0].id : defaultClubId;

    updateAccountMutation.mutate(
      {
        id: userId,
        name: userDetails.name || '',
        email: userDetails.email || '',
        defaultClubId: resolvedDefaultClubId || null,
        image: userDetails.image || null,
        password: userDetails.password || undefined,
      },
      {
        onSuccess: () => {
          setSuccess(t('profile.updatedSuccess'));
          setError(null);
        },
        onError: (err) => {
          log.error('Error updating profile:', err);
          setError(err instanceof Error ? err.message : t('profile.updateError'));
          setSuccess(null);
        },
      }
    );
  };

  return (
    <Box sx={{ maxWidth: 600, margin: '0 auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        {t('profile.title')}
      </Typography>

      {success ? (
        <Typography variant="body1" sx={{ color: (theme) => theme.palette.success.main }}>
          {success}
        </Typography>
      ) : null}
      {error ? (
        <Typography variant="body1" sx={{ color: (theme) => theme.palette.error.main }}>
          {error}
        </Typography>
      ) : null}

      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={photoPreview || undefined}
              alt={t('profile.title') as string}
              sx={{ width: 64, height: 64 }}
            />
            <Button variant="outlined" component="label">
              {t('profile.uploadPhoto')}
              <input type="file" hidden accept="image/*" onChange={handlePhotoChange} />
            </Button>
          </Box>

          <TextField
            label={t('common.name')}
            name="name"
            value={userDetails.name}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            label={t('common.email')}
            name="email"
            value={userDetails.email}
            onChange={handleInputChange}
            fullWidth
            disabled
          />
          <TextField
            label={t('profile.newPassword')}
            name="password"
            type="password"
            value={userDetails.password}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            label={t('profile.confirmPassword')}
            name="confirmPassword"
            type="password"
            value={userDetails.confirmPassword}
            onChange={handleInputChange}
            fullWidth
          />
          {userClubs.length > 1 && (
            <TextField
              select
              label={t('profile.defaultClub')}
              value={defaultClubId}
              onChange={(e) => {
                const clubId = Number(e.target.value);
                setDefaultClubId(clubId);
                setUserDetails((prev) => ({
                  ...prev,
                  defaultClubId: clubId,
                }));
              }}
              fullWidth
              slotProps={{
                select: {
                  native: true,
                },
              }}
            >
              <option value={0} disabled>
                {t('profile.selectClub')}
              </option>
              {userClubs.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name}
                </option>
              ))}
            </TextField>
          )}

          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={updateAccountMutation.isPending}
          >
            {t('profile.update')}
          </Button>
        </Stack>
      </form>
    </Box>
  );
};

export default ProfilePage;
