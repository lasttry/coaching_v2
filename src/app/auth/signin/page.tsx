'use client';
import React, { ReactElement, useState } from 'react';
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Button,
  Stack,
  Checkbox,
  Alert,
} from '@mui/material';
import { signIn } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import CustomTextField from '@/app/(DashboardLayout)/components/forms/theme-elements/CustomTextField';
import { log } from '@/lib/logger';

const SignInPage = (): ReactElement => {
  const { update } = useSession();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    // Basic validation
    if (!username || !password) {
      setErrorMessage('Please fill in all fields');
      setTimeout(() => setErrorMessage(''), 10000); // Clear error after 10s
      return;
    }

    try {
      // Call NextAuth's signIn function
      const response = await signIn('credentials', {
        redirect: false,
        email: username,
        password,
      });

      // Check if there's an error
      if (response?.error) {
        log.error('Login failed:', response.error);
        setErrorMessage('Invalid username or password');
        setTimeout(() => setErrorMessage(''), 10000); // Clear error after 10s
        return;
      }

      // Fetch user details using the `/api/accounts` endpoint
      const accountResponse = await fetch(`/api/accounts?email=${encodeURIComponent(username)}`);
      const data = await accountResponse.json();

      if (!accountResponse.ok) {
        const errorText = data?.error || 'Failed to fetch user details';
        log.error(errorText);
        setErrorMessage(errorText);
        setTimeout(() => setErrorMessage(''), 10000); // Clear error after 10s
        return;
      }


      // Redirect logic based on account data
      if (data.length >= 1 && data[0].defaultClubId !== 0) {
        router.push('/utilities/games');
      } else if (data[0].clubs.length === 1) {
        const updatedSession = await update({
          selectedClubId: data[0].clubs[0].clubId,
        });
        router.push('/utilities/games');
      } else {
        router.push('/utilities/chooseClub');
      }
    } catch (error) {
      log.error('Unexpected error during login:', error);
      setErrorMessage('An unexpected error occurred. Please try again.');
      setTimeout(() => setErrorMessage(''), 10000); // Clear error after 10s
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
      <Box
        component="form"
        onSubmit={handleSignIn}
        sx={{ width: 400, padding: 4, boxShadow: 3, borderRadius: 2 }}
      >
        {/* Success/Error Messages */}
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        <Typography fontWeight="700" variant="h2" mb={1}>
          Sign In
        </Typography>

        <Typography>Please enter your credentials to sign in.</Typography>

        <Stack>
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              component="label"
              htmlFor="username"
              mb="5px"
            >
              Username
            </Typography>
            <CustomTextField
              variant="outlined"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Box>
          <Box mt="25px">
            <Typography
              variant="subtitle1"
              fontWeight={600}
              component="label"
              htmlFor="password"
              mb="5px"
            >
              Password
            </Typography>
            <CustomTextField
              type="password"
              variant="outlined"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Box>
          <Stack justifyContent="space-between" direction="row" alignItems="center" my={2}>
            <FormGroup>
              <FormControlLabel
                control={<Checkbox defaultChecked />}
                label="Remember this Device"
              />
            </FormGroup>
          </Stack>
        </Stack>

        <Box>
          <Button color="primary" variant="contained" size="large" fullWidth type="submit">
            Sign In
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default SignInPage;
