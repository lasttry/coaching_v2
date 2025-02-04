'use client';
import React from 'react';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { TextField, Button, Typography, Stack, Box, Avatar } from '@mui/material';
import { AccountInterface } from '@/types/accounts/types';

const ProfilePage = () => {
  const { data: session, status } = useSession();

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

  useEffect(() => {
    if (!session) {
      return;
    }
    console.log(status);
    console.log(session);
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/accounts/${session?.user?.id}`);
        const data = await response.json();

        if (response.ok) {
          setUserDetails((prev) => ({
            ...prev,
            ...data,
          }));
          if (data.image) {
            setPhotoPreview(`data:image/png;base64,${data.image}`);
          }

          // Fetch user clubs
          if (data.clubs) {
            setUserClubs(data.clubs);
            if (data.clubs.length === 1) {
              setDefaultClubId(data.clubs[0].id);
              setUserDetails((prev) => prev);
            }
          }
        } else {
          setError(data.error || 'Failed to fetch profile.');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('An error occurred while fetching the profile.');
      }
    };

    fetchProfile();
  }, [session]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        setUserDetails((prev) => ({
          ...prev,
          image: base64String.split(',')[1], // Strip off the data URL prefix
        }));
        setPhotoPreview(base64String); // Update preview
      };
      reader.readAsDataURL(file); // Read file as Base64
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/accounts/${session?.user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...userDetails,
          defaultClubId: defaultClubId == 0 ? userClubs[0].id : defaultClubId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Profile updated successfully!');
        setError(null);
      } else {
        setError(data.error || 'Failed to update profile.');
        setSuccess(null);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('An error occurred while updating the profile.');
      setSuccess(null);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, margin: '0 auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        User Profile
      </Typography>

      {/* Success/Error Messages */}
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
          {/* Profile Photo Section */}
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar src={photoPreview || undefined} alt="Profile Photo" sx={{ width: 64, height: 64 }} />
            <Button variant="outlined" component="label">
              Upload Photo
              <input type="file" hidden accept="image/*" onChange={handlePhotoChange} />
            </Button>
          </Box>

          <TextField label="Name" name="name" value={userDetails.name} onChange={handleInputChange} fullWidth />
          <TextField
            label="Email"
            name="email"
            value={userDetails.email}
            onChange={handleInputChange}
            fullWidth
            disabled // Optional: Disallow editing email
          />
          <TextField label="New Password" name="password" type="password" value={userDetails.password} onChange={handleInputChange} fullWidth />
          <TextField
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={userDetails.confirmPassword}
            onChange={handleInputChange}
            fullWidth
          />
          {userClubs.length > 1 && (
            <TextField
              select
              label="Default Club"
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
              SelectProps={{
                native: true, // Use native dropdown
              }}
            >
              <option value={0} disabled>
                Select a club
              </option>
              {userClubs.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name}
                </option>
              ))}
            </TextField>
          )}

          <Button variant="contained" color="primary" type="submit">
            Update Profile
          </Button>
        </Stack>
      </form>
    </Box>
  );
};

export default ProfilePage;
