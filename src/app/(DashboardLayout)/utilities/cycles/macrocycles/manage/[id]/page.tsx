'use client';
import React, { useState, useEffect, use, ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import { Button, TextField, Box, Typography, Stack, CircularProgress } from '@mui/material';

import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import dayjs from 'dayjs';
import { MacrocycleInterface } from '@/types/cycles/types';

type Params = Promise<{ id: string }>;

const MacrocycleForm = (props: { params: Params }): ReactElement => {
  const router = useRouter();
  const params = use(props.params);
  const id = params?.id; // Use segmentData to retrieve the ID
  const isEditing = id !== 'new';

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<MacrocycleInterface>({
    id: 0,
    name: '',
    number: undefined,
    startDate: new Date(dayjs().toISOString()),
    endDate: new Date(dayjs().add(1, 'month').toISOString()),
    notes: '',
    mesocycles: [],
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      fetch(`/api/cycles/macrocycles/${id}`)
        .then((response) => response.json())
        .then((data: MacrocycleInterface) => {
          setForm(data);
          setLoading(false);
        })
        .catch(() => {
          setError('Failed to load Macrocycle data.');
          setLoading(false);
        });
    }
  }, [id, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);

    try {
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing ? `/api/cycles/macrocycles/${id}` : '/api/cycles/macrocycles';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        setSuccess('Macrocycle saved successfully.');
        setTimeout(() => router.push('/utilities/cycles/macrocycles'), 2000);
      } else {
        throw new Error('Failed to save Macrocycle.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <PageContainer title={isEditing ? 'Edit Macrocycle' : 'Create Macrocycle'}>
      <h1>{isEditing ? 'Edit Macrocycle' : 'Create Macrocycle'}</h1>

      {error && (
        <Typography variant="body1" sx={{ color: (theme) => theme.palette.error.main }}>
          {error}
        </Typography>
      )}

      {success && (
        <Typography variant="body1" sx={{ color: (theme) => theme.palette.success.main }}>
          {success}
        </Typography>
      )}

      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextField
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="Number"
            name="number"
            type="number"
            value={form.number || ''}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Start Date"
            name="startDate"
            type="datetime-local"
            value={dayjs(form.startDate).format('YYYY-MM-DDTHH:mm')}
            onChange={(e) => {
              const { name, value } = e.target;
              handleChange({
                target: {
                  name,
                  value: new Date(value).toISOString(),
                },
              } as React.ChangeEvent<HTMLInputElement>);
            }}
            fullWidth
            required
          />
          <TextField
            label="End Date"
            name="endDate"
            type="datetime-local"
            value={dayjs(form.endDate).format('YYYY-MM-DDTHH:mm')}
            onChange={(e) => {
              const { name, value } = e.target;
              handleChange({
                target: {
                  name,
                  value: new Date(value).toISOString(),
                },
              } as React.ChangeEvent<HTMLInputElement>);
            }}
            fullWidth
            required
          />
          <TextField
            label="Notes"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            fullWidth
            multiline
            rows={4}
          />
          <Box display="flex" justifyContent="space-between">
            <Button type="submit" variant="contained" color="primary">
              Save
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => router.push('/utilities/cycles/macrocycles')}
            >
              Cancel
            </Button>
          </Box>
        </Stack>
      </form>
    </PageContainer>
  );
};

export default MacrocycleForm;
