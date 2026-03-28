'use client';
import React, { ReactElement, useState, useEffect, Suspense } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Alert,
  Link as MuiLink,
  CircularProgress,
} from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import CustomTextField from '@/app/(DashboardLayout)/components/forms/theme-elements/CustomTextField';
import { useMessage } from '@/hooks/useMessage';

const ResetPasswordContent = (): ReactElement => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { message: errorMessage, setTimedMessage: setErrorMessage } = useMessage(10000);

  useEffect(() => {
    const validateToken = async (): Promise<void> => {
      if (!token) {
        setIsValidating(false);
        return;
      }

      try {
        const response = await fetch(`/api/auth/reset-password?token=${token}`);
        setIsValidToken(response.ok);
      } catch {
        setIsValidToken(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setErrorMessage(data.error || 'Failed to reset password');
        return;
      }

      setIsSuccess(true);
    } catch {
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidating) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!token || !isValidToken) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Box sx={{ width: 400, padding: 4, boxShadow: 3, borderRadius: 2, textAlign: 'center' }}>
          <Typography fontWeight="700" variant="h4" mb={2} color="error">
            Invalid or Expired Link
          </Typography>
          <Typography variant="body1" mb={3}>
            This password reset link is invalid or has expired. Please request a new one.
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push('/auth/forgot-password')}
            fullWidth
          >
            Request New Link
          </Button>
        </Box>
      </Box>
    );
  }

  if (isSuccess) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Box sx={{ width: 400, padding: 4, boxShadow: 3, borderRadius: 2, textAlign: 'center' }}>
          <Typography fontWeight="700" variant="h4" mb={2} color="success.main">
            Password Reset Successful
          </Typography>
          <Typography variant="body1" mb={3}>
            Your password has been reset successfully. You can now sign in with your new password.
          </Typography>
          <Button variant="contained" onClick={() => router.push('/auth/signin')} fullWidth>
            Sign In
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ width: 400, padding: 4, boxShadow: 3, borderRadius: 2 }}
      >
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <Typography fontWeight="700" variant="h4" mb={1}>
          Reset Password
        </Typography>

        <Typography variant="body2" mb={3}>
          Enter your new password below.
        </Typography>

        <Stack spacing={2}>
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              component="label"
              htmlFor="password"
              mb="5px"
            >
              New Password
            </Typography>
            <CustomTextField
              variant="outlined"
              fullWidth
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
            />
          </Box>

          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              component="label"
              htmlFor="confirmPassword"
              mb="5px"
            >
              Confirm Password
            </Typography>
            <CustomTextField
              variant="outlined"
              fullWidth
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
            />
          </Box>

          <Button
            color="primary"
            variant="contained"
            size="large"
            fullWidth
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </Button>

          <Box textAlign="center">
            <MuiLink href="/auth/signin" variant="body2" sx={{ cursor: 'pointer' }}>
              Back to Sign In
            </MuiLink>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

const ResetPasswordPage = (): ReactElement => {
  return (
    <Suspense
      fallback={
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <CircularProgress />
        </Box>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
};

export default ResetPasswordPage;
