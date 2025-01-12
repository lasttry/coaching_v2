'use client';
import React from 'react';
import { useState } from 'react';
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Button,
  Stack,
  Checkbox,
} from '@mui/material';
import { signIn } from 'next-auth/react'; // Import signIn from NextAuth
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import CustomTextField from '@/app/(DashboardLayout)/components/forms/theme-elements/CustomTextField'; // Adjust the path based on your folder structure

const SignInPage = () => {
  const { update } = useSession();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    // Call NextAuth's signIn function
    const response = await signIn('credentials', {
      redirect: false, // Prevent redirecting
      email: username,
      password: password,
    });

    if (response?.error) {
      // If an error occurs, display it
      setError(response.error || 'Login failed');
    } else if (response?.ok) {
      // Fetch user details using the `/api/account` endpoint and email address
      const accountResponse = await fetch(
        `/api/accounts?email=${encodeURIComponent(username)}`,
      );
      if (accountResponse.ok) {
        const accountData = await accountResponse.json();
        console.log(accountData);
        if (accountData.length > 1 && accountData[0].defaultClubId) {
          // Redirect to games if defaultClubId exists
          router.push('/utilities/games');
        } else if (accountData[0].clubs.length == 1) {
          const updatedSession = await update({
            selectedClubId: accountData[0].clubs[0].clubId,
          }); // Call the `update()` method provided by NextAuth
          console.log('Updated session:', updatedSession);
          router.push('/utilities/games');
        } else {
          // Redirect to chooseClub if defaultClubId is missing
          router.push('/utilities/chooseClub');
        }
      } else {
        const errorData = await accountResponse.json();
        if (errorData?.error) {
          setError(`Failed to fetch user details: ${errorData.error}`);
        } else {
          setError('Failed to fetch user details');
        }
      }
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
    >
      <Box
        component="form"
        onSubmit={handleSignIn} // Attach form submit handler
        sx={{ width: 400, padding: 4, boxShadow: 3, borderRadius: 2 }}
      >
        {error && (
          <Typography variant="body1" color="error" mb={2}>
            {error}
          </Typography>
        )}

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
              onChange={(e) => setUsername(e.target.value)} // Set username
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
              onChange={(e) => setPassword(e.target.value)} // Set password
            />
          </Box>
          <Stack
            justifyContent="space-between"
            direction="row"
            alignItems="center"
            my={2}
          >
            <FormGroup>
              <FormControlLabel
                control={<Checkbox defaultChecked />}
                label="Remember this Device"
              />
            </FormGroup>
            <Typography
              component="a"
              href="/"
              fontWeight="500"
              sx={{
                textDecoration: 'none',
                color: 'primary.main',
              }}
            >
              Forgot Password?
            </Typography>
          </Stack>
        </Stack>

        <Box>
          <Button
            color="primary"
            variant="contained"
            size="large"
            fullWidth
            type="submit" // Ensure this triggers form submission
          >
            Sign In
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default SignInPage;
