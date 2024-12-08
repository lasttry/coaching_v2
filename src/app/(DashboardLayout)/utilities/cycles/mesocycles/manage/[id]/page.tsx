'use client';

import { useState, useEffect, use } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Button,
  TextField,
  Box,
  Typography,
  Stack,
  CircularProgress,
  Select,
  SelectChangeEvent,
  MenuItem,
} from '@mui/material';

import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import dayjs from 'dayjs';
import { MesocycleInterface, MacrocycleInterface } from '@/types/cycles/types';
type Params = Promise<{ id: string }>;

const MesocycleForm = (props: { params: Params }) => {
  const router = useRouter();
  const params = use(props.params);
  const id = params?.id; // Use segmentData to retrieve the ID
  const isEditing = id !== 'new';

  const [loading, setLoading] = useState(false);
  const [macrocycles, setMacrocycles] = useState<MacrocycleInterface[]>([]);
  const [form, setForm] = useState<MesocycleInterface>({
    id: 0,
    number: undefined,
    name: '',
    startDate: new Date(dayjs().toISOString()),
    endDate: new Date(dayjs().add(1, 'month').toISOString()),
    notes: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Fetch all macrocycles for the dropdown
        const macrocyclesResponse = await fetch('/api/cycles/macrocycles');
        const macrocyclesData: MacrocycleInterface[] = await macrocyclesResponse.json();
        setMacrocycles(macrocyclesData);

        if (isEditing) {
          // Fetch mesocycle data if editing
          const mesocycleResponse = await fetch(`/api/cycles/mesocycles/${id}`);
          const mesocycleData: MesocycleInterface = await mesocycleResponse.json();
          setForm(mesocycleData);
        }
      } catch (err) {
        setError('Failed to fetch data.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name!]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing ? `/api/cycles/mesocycles/${id}` : '/api/cycles/mesocycles';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        setSuccess('Mesocycle saved successfully.');
        setTimeout(() => router.push('/utilities/cycles/mesocycles'), 2000);
      } else {
        throw new Error('Failed to save Mesocycle.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <PageContainer title={isEditing ? 'Edit Mesocycle' : 'Create Mesocycle'}>
      <h1>{isEditing ? 'Edit Mesocycle' : 'Create Mesocycle'}</h1>

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
          {/* Macrocycle Dropdown */}
          <Select
            name="macrocycleId"
            value={form.macrocycleId ? String(form.macrocycleId) : ''}
            onChange={(e: SelectChangeEvent<string>) => {
              const value = parseInt(e.target.value, 10); // Convert string value to number
              setForm((prev) => ({ ...prev, macrocycleId: value }));
            }}
            fullWidth
            required
            displayEmpty
          >
            <MenuItem value="" disabled>
              Select a Macrocycle
            </MenuItem>
            {macrocycles.map((macrocycle) => (
              <MenuItem key={macrocycle.id} value={String(macrocycle.id)}>
                {macrocycle.name || `Macrocycle ${macrocycle.number || 'N/A'}`}
              </MenuItem>
            ))}
          </Select>


          {/* Mesocycle Number */}
          <TextField
            label="Number"
            name="number"
            type="number"
            value={form.number || ''}
            onChange={handleChange}
            fullWidth
          />

          {/* Mesocycle Name */}
          <TextField
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            required
          />

          {/* Start Date */}
          <TextField
            label="Start Date"
            name="startDate"
            type="datetime-local"
            value={dayjs(form.startDate).format('YYYY-MM-DDTHH:mm')}
            onChange={(e) =>
              handleChange({
                ...e,
                target: { ...e.target, value: new Date(e.target.value).toISOString() },
              })
            }
            fullWidth
            required
          />

          {/* End Date */}
          <TextField
            label="End Date"
            name="endDate"
            type="datetime-local"
            value={dayjs(form.endDate).format('YYYY-MM-DDTHH:mm')}
            onChange={(e) =>
              handleChange({
                ...e,
                target: { ...e.target, value: new Date(e.target.value).toISOString() },
              })
            }
            fullWidth
            required
          />

          {/* Notes */}
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
            <Button variant="outlined" color="secondary" onClick={() => router.push('/utilities/cycles/mesocycles')}>
              Cancel
            </Button>
          </Box>
        </Stack>
      </form>
    </PageContainer>
  );
};

export default MesocycleForm;
