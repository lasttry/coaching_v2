'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
  Stack,
} from '@mui/material';
import { Macrocycle, Mesocycle, MaxNumbers } from '@/types/cycles/types';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import dayjs from 'dayjs';

type Params = Promise<{ id: string }>;

const MesoCycleForm = (props: { params: Params }) => {
  const params = use(props.params);
  const id = params.id === 'new' ? null : params.id;
  const [mesoCycle, setMesoCycle] = useState<Partial<Mesocycle>>({
    number: -1,
    startDate: dayjs().format('YYYY-MM-DD'),
    endDate: dayjs().add(1, 'month').format('YYYY-MM-DD'),
    notes: '',
    macrocycleId: 0,
  });
  const [macroCycles, setMacroCycles] = useState<Macrocycle[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Fetch MacroCycles for the dropdown
    async function fetchMacroCycles() {
      try {
        const response = await fetch('/api/cycles/macrocycles');
        const data: Macrocycle[] = await response.json();
        setMacroCycles(data);
      } catch (err) {
        console.error('Error fetching macrocycles:', err);
        setError('Failed to load macrocycles.');
      }
    }

    // Fetch Mesocycle data if editing an existing one
    async function fetchMesoCycle() {
      if(!id) {
        console.log("getting max number")
        try {
          const response = await fetch(`/api/cycles/mesocycles/maxNumber`);
          const maxNumber: MaxNumbers = await response.json();
          console.log(maxNumber.maxNumber)
          setMesoCycle({ ...mesoCycle, number: (maxNumber.maxNumber + 1) });
        } catch (err) {
          console.error('Error fetching maxNumber:', err);
          setError('Failed to load maxNumber.');
        }        
      }
      if (id) {
        try {
          const response = await fetch(`/api/cycles/mesocycles/${id}`);
          const data: Mesocycle = await response.json();
          setMesoCycle(data);
        } catch (err) {
          console.error('Error fetching mesocycle:', err);
          setError('Failed to load mesocycle.');
        }
      }
    }

    fetchMacroCycles();
    fetchMesoCycle();
  }, [id]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/cycles/mesocycles/${id || ''}`, {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mesoCycle),
      });

      if (response.ok) {
        router.push('/utilities/cycles/mesocycles');
      } else {
        setError('Failed to save mesocycle.');
      }
    } catch (err) {
      console.error('Error saving mesocycle:', err);
      setError('An error occurred while saving the mesocycle.');
    }
  };

  return (
    <PageContainer title={id ? 'Edit Mesocycle' : 'Add Mesocycle'}>
      <Typography variant="h4" component="h1" gutterBottom>
        {id ? 'Edit Mesocycle' : 'Add Mesocycle'}
      </Typography>

      {error && (
        <Typography variant="body1" color="error" gutterBottom>
          {error}
        </Typography>
      )}

      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>

          {/* Macrocycle Dropdown */}
          <TextField
            select
            label="Macrocycle"
            value={mesoCycle.macrocycleId  ? mesoCycle.macrocycleId : ""}
            onChange={(e) => setMesoCycle({ ...mesoCycle, macrocycleId: Number(e.target.value) })}
            required
          >
            {macroCycles.map((macro) => (
              <MenuItem key={macro.id} value={macro.id}>
                {macro.number} - {macro.name}
              </MenuItem>
            ))}
          </TextField>

          {/* Mesocycle Number */}
          <TextField
            label="Number"
            type="number"
            value={mesoCycle.number}
            onChange={(e) => setMesoCycle({ ...mesoCycle, number: Number(e.target.value) })}
            required
          />

          {/* Start Date */}
          <TextField
            label="Start Date"
            type="date"
            value={mesoCycle.startDate}
            onChange={(e) => setMesoCycle({ ...mesoCycle, startDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
            required
          />

          {/* End Date */}
          <TextField
            label="End Date"
            type="date"
            value={mesoCycle.endDate}
            onChange={(e) => setMesoCycle({ ...mesoCycle, endDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
            required
          />

          {/* Notes */}
          <TextField
            label="Notes"
            multiline
            minRows={4}
            value={mesoCycle.notes}
            onChange={(e) => setMesoCycle({ ...mesoCycle, notes: e.target.value })}
          />

          {/* Submit Button */}
          <Box>
            <Button variant="contained" color="primary" type="submit">
              {id ? 'Update Mesocycle' : 'Create Mesocycle'}
            </Button>
          </Box>
        </Stack>
      </form>
    </PageContainer>
  );
};

export default MesoCycleForm;
