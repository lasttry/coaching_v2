'use client';
import React, { ReactElement, useRef, useEffect, use } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import { TextField, Button, Box, Stack, Typography } from '@mui/material';
import { log } from '@/lib/logger';
import { useMessage } from '@/hooks/useMessage';

import '@/lib/i18n.client';
import { useTranslation } from 'react-i18next';

// Define the Athlete type based on the schema
interface Athlete {
  id: number;
  number: string;
  name: string;
  birthdate: string; // Birthdate is in ISO 8601 format initially
  fpbNumber?: number | null;
  idNumber?: number | null;
  idType?: string | null;
}

type Params = Promise<{ id: string }>;

const EditAthlete = (props: { params: Params }): ReactElement => {
  const { t } = useTranslation();

  const params = use(props.params);
  const [form, setForm] = useState<Athlete | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { message: error, setTimedMessage: setError, setMessage } = useMessage(5000);
  const [success, setSuccess] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  // Convert ISO date to "yyyy-MM-dd"
  const formatDate = (dateString: string): string => {
    return dateString.split('T')[0]; // Convert "yyyy-MM-ddTHH:mm:ss.sssZ" to "yyyy-MM-dd"
  };

  // Fetch the athlete data when the component mounts
  useEffect(() => {
    async function fetchAthlete(): Promise<void> {
      try {
        const response = await fetch(`/api/athletes/${params.id}`);
        const data: Athlete = await response.json();
        data.birthdate = formatDate(data.birthdate); // Format the birthdate for the input field
        setForm(data);
      } catch (err) {
        log.error('Error fetching athlete:', err);
        setMessage(t('failedFetchAthleteData'));
      } finally {
        setLoading(false);
      }
    }

    fetchAthlete();
  }, [params.id, t, setMessage]);

  // Handle input change and reset field error on change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    if (form) {
      setForm((prev) => ({ ...prev!, [name]: value }));
      setFormErrors((prevErrors) => ({ ...prevErrors, [name]: '' })); // Reset error for this field
    }
  };

  // Validate form fields
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validate number
    if (!form?.number) {
      errors.number = 'Number is required';
    }

    // Validate name
    if (!form?.name) {
      errors.name = 'Name is required';
    }

    // Validate birthdate
    if (!form?.birthdate) {
      errors.birthdate = 'Birthdate is required';
    } else if (isNaN(new Date(form.birthdate).getTime())) {
      errors.birthdate = 'Birthdate is invalid';
    }

    // Validate FPB number if provided
    if (form?.fpbNumber && isNaN(Number(form.fpbNumber))) {
      errors.fpbNumber = 'FPB Number must be a valid number';
    }

    // Validate ID number if provided
    if (form?.idNumber && isNaN(Number(form.idNumber))) {
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
      const response = await fetch(`/api/athletes/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        setSuccess('Athlete updated successfully.');
        redirectTimeoutRef.current = setTimeout(() => {
          router.push('/utilities/athletes');
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update athlete.');
      }
    } catch (err) {
      log.error('Error updating athlete:', err);
      setError('An unknown error occurred.');
    }
  };

  // Handle cancel action to return to the athletes list
  const handleCancel = (): void => {
    router.push('/utilities/athletes'); // Redirect to athletes list
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <PageContainer title="Edit Athlete" description="Edit athlete details">
      <h1>Edit Athlete</h1>
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {/* Number Field */}
          <TextField
            label="Number"
            name="number"
            value={form?.number || ''}
            onChange={handleChange}
            required
            error={!!formErrors.number}
            helperText={formErrors.number}
          />

          {/* Name Field */}
          <TextField
            label="Name"
            name="name"
            value={form?.name || ''}
            onChange={handleChange}
            required
            error={!!formErrors.name}
            helperText={formErrors.name}
          />

          {/* Birthdate Field */}
          <TextField
            label="Birthdate"
            name="birthdate"
            type="date"
            value={form?.birthdate || ''}
            onChange={handleChange}
            required
            error={!!formErrors.birthdate}
            helperText={formErrors.birthdate}
          />

          {/* FPB Number Field */}
          <TextField
            label="FPB Number"
            name="fpbNumber"
            value={form?.fpbNumber || ''}
            onChange={handleChange}
            error={!!formErrors.fpbNumber}
            helperText={formErrors.fpbNumber}
          />

          {/* ID Number Field */}
          <TextField
            label="ID Number"
            name="idNumber"
            value={form?.idNumber || ''}
            onChange={handleChange}
            error={!!formErrors.idNumber}
            helperText={formErrors.idNumber}
          />

          {/* ID Type Field */}
          <TextField
            label="ID Type"
            name="idType"
            value={form?.idType || ''}
            onChange={handleChange}
          />

          <Box display="flex" justifyContent="space-between">
            <Button type="submit" variant="contained" color="primary">
              Save Changes
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

export default EditAthlete;
