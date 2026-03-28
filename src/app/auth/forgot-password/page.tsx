'use client';
import React, { ReactElement, useState } from 'react';
import { Box, Typography, Button, Stack, Alert, Link as MuiLink } from '@mui/material';
import { useRouter } from 'next/navigation';
import CustomTextField from '@/app/(DashboardLayout)/components/forms/theme-elements/CustomTextField';
import { useMessage } from '@/hooks/useMessage';

const ForgotPasswordPage = (): ReactElement => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { message: errorMessage, setTimedMessage: setErrorMessage } = useMessage(10000);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!email) {
      setErrorMessage('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        setErrorMessage(data.error || 'Failed to send reset email');
        return;
      }

      setIsSubmitted(true);
    } catch {
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Box sx={{ width: 400, padding: 4, boxShadow: 3, borderRadius: 2, textAlign: 'center' }}>
          <Typography fontWeight="700" variant="h4" mb={2}>
            Check Your Email
          </Typography>
          <Typography variant="body1" mb={3}>
            If an account exists with <strong>{email}</strong>, you will receive a password reset
            link shortly.
          </Typography>
          <Button variant="outlined" onClick={() => router.push('/auth/signin')} fullWidth>
            Back to Sign In
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
          Forgot Password
        </Typography>

        <Typography variant="body2" mb={3}>
          Enter your email address and we&apos;ll send you a link to reset your password.
        </Typography>

        <Stack spacing={2}>
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              component="label"
              htmlFor="email"
              mb="5px"
            >
              Email Address
            </Typography>
            <CustomTextField
              variant="outlined"
              fullWidth
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
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
            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
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

export default ForgotPasswordPage;
