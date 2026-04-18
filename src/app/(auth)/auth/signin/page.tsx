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
import { useRouter } from 'next/navigation';
import CustomTextField from '@/app/components/forms/theme-elements/CustomTextField';
import { log } from '@/lib/logger';
import { useMessage } from '@/hooks/useMessage';

const SignInPage = (): ReactElement => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { message: errorMessage, setTimedMessage: setErrorMessage } = useMessage(10000);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!username || !password) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    try {
      const response = await signIn('credentials', {
        redirect: false,
        email: username,
        password,
      });

      if (response?.error) {
        log.error('Login failed:', response.error);
        setErrorMessage('Invalid username or password');
        return;
      }

      const accountResponse = await fetch(`/api/accounts?email=${encodeURIComponent(username)}`);
      const data = await accountResponse.json();

      if (!accountResponse.ok) {
        const errorText = data?.error || 'Failed to fetch user details';
        log.error(errorText);
        setErrorMessage(errorText);
        return;
      }

      if (data.length >= 1 && data[0].defaultClubId !== 0) {
        router.push('/utilities/games');
      } else if (data[0].clubs.length === 1) {
        router.push('/utilities/games');
      } else {
        router.push('/utilities/chooseClub');
      }
    } catch (error) {
      log.error('Unexpected error during login:', error);
      setErrorMessage('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Box
        component="form"
        onSubmit={handleSignIn}
        sx={{ width: 400, padding: 4, boxShadow: 3, borderRadius: 2 }}
      >
        {/* Success/Error Messages */}
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        <Typography variant="h2" sx={{ fontWeight: 700, mb: 1 }}>
          Sign In
        </Typography>

        <Typography>Please enter your credentials to sign in.</Typography>

        <Stack>
          <Box>
            <Typography
              variant="subtitle1"
              component="label"
              htmlFor="username"
              sx={{ fontWeight: 600, mb: '5px' }}
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
          <Box sx={{ mt: '25px' }}>
            <Typography
              variant="subtitle1"
              component="label"
              htmlFor="password"
              sx={{ fontWeight: 600, mb: '5px' }}
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
          <Stack
            direction="row"
            sx={{ justifyContent: 'space-between', alignItems: 'center', my: 2 }}
          >
            <FormGroup>
              <FormControlLabel
                control={<Checkbox defaultChecked />}
                label="Remember this Device"
              />
            </FormGroup>
            <Typography
              variant="body2"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push('/auth/forgot-password');
              }}
              sx={{
                cursor: 'pointer',
                color: 'primary.main',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Forgot Password?
            </Typography>
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
