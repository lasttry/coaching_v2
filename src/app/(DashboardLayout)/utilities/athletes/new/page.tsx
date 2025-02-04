'use client';
import React, { ReactElement } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import { TextField, Button, Box, Stack, Typography } from '@mui/material';
import { AthleteInterface } from '@/types/games/types';
import { useSession } from 'next-auth/react';

const NewAthlete = (): ReactElement => {
  const { data: session } = useSession();

  const [form, setForm] = useState<AthleteInterface>({
    id: null,
    number: '',
    name: '',
    birthdate: '',
    fpbNumber: null,
    idNumber: null,
    idType: '',
    active: true,
    clubId: session?.user.selectedClubId,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Handle input change and reset field error on change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'fpbNumber' || name === 'idNumber' ? (value ? Number(value) : null) : value,
    }));
    setFormErrors((prevErrors) => ({ ...prevErrors, [name]: '' })); // Reset error for this field
  };

  // Validate form fields
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validate number
    if (!form.number) {
      errors.number = 'Number is required';
    }

    // Validate name
    if (!form.name) {
      errors.name = 'Name is required';
    }

    // Validate birthdate
    if (!form.birthdate) {
      errors.birthdate = 'Birthdate is required';
    } else if (isNaN(new Date(form.birthdate).getTime())) {
      errors.birthdate = 'Invalid birthdate format. Use yyyy-MM-dd.';
    }

    // Validate FPB number if provided
    if (form.fpbNumber && isNaN(Number(form.fpbNumber))) {
      errors.fpbNumber = 'FPB Number must be a valid number';
    }

    // Validate ID number if provided
    if (form.idNumber && isNaN(Number(form.idNumber))) {
      errors.idNumber = 'ID Number must be a valid number';
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0; // Form is valid if no errors
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    // Validate the form before submission
    if (!validateForm()) {
      return; // If validation fails, do not proceed with submission
    }

    try {
      if (!session?.user?.selectedClubId) {
        throw new Error('Club ID is missing from the session');
      }
      const athleteData = { ...form, clubId: session.user.selectedClubId };
      const response = await fetch('/api/athletes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(athleteData),
      });

      if (response.ok) {
        setSuccess('Athlete added successfully.');
        setError(null);
        setTimeout(() => {
          router.push('/utilities/athletes'); // Redirect to the list page after 2 seconds
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to add athlete.');
        setTimeout(() => {
          setError(null);
        }, 5000);
      }
    } catch (err) {
      console.error('Error adding athlete:', err);
      setError('An unknown error occurred.');
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  };

  // Handle cancel action to return to the athletes list
  const handleCancel = (): void => {
    router.push('/utilities/athletes'); // Redirect to athletes list
  };

  return (
    <PageContainer title="Add New Athlete" description="Create a new athlete">
      <h1>New Athlete</h1>
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {/* Number Field */}
          <TextField
            label="Number"
            name="number"
            value={form.number}
            onChange={handleChange}
            required
            error={!!formErrors.number}
            helperText={formErrors.number}
          />

          {/* Name Field */}
          <TextField label="Name" name="name" value={form.name} onChange={handleChange} required error={!!formErrors.name} helperText={formErrors.name} />

          {/* Birthdate Field */}
          <TextField
            label="Birthdate"
            name="birthdate"
            type="date"
            value={form.birthdate}
            onChange={handleChange}
            required
            error={!!formErrors.birthdate}
            helperText={formErrors.birthdate}
          />

          {/* FPB Number Field */}
          <TextField
            label="FPB Number"
            name="fpbNumber"
            value={form.fpbNumber || ''}
            onChange={handleChange}
            error={!!formErrors.fpbNumber}
            helperText={formErrors.fpbNumber}
          />

          {/* ID Number Field */}
          <TextField
            label="ID Number"
            name="idNumber"
            value={form.idNumber || ''}
            onChange={handleChange}
            error={!!formErrors.idNumber}
            helperText={formErrors.idNumber}
          />

          {/* ID Type Field */}
          <TextField label="ID Type" name="idType" value={form.idType || ''} onChange={handleChange} />

          <Box display="flex" justifyContent="space-between">
            <Button type="submit" variant="contained" color="primary">
              Add Athlete
            </Button>

            {/* Cancel Button */}
            <Button type="button" variant="outlined" color="secondary" onClick={handleCancel}>
              Cancel
            </Button>
          </Box>

          {/* Success/Error Messages */}
          {success && <Typography sx={{ color: 'green' }}>{success}</Typography>}
          {error && <Typography sx={{ color: 'red' }}>{error}</Typography>}
        </Stack>
      </form>
    </PageContainer>
  );
};

export default NewAthlete;
