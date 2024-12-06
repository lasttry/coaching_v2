'use client';

import { useState, useEffect, use } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Button,
  TextField,
  Select,
  MenuItem,
  Typography,
  Stack,
  Box,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from 'dayjs';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import { Microcycle, Macrocycle, Mesocycle, SessionGoal } from '@/types/cycles/types';

type Params = Promise<{ id: string }>;

const ManageMicrocyclePage = (props: { params: Params }) => {
  const router = useRouter();
  const params = use(props.params);
  const microcycleId = params?.id;
  console.log(microcycleId)

  const isEditing = microcycleId !== 'new';
  const [macrocycles, setMacrocycles] = useState<Macrocycle[]>([]);
  const [mesocycles, setMesocycles] = useState<Mesocycle[]>([]);
  const [selectedMacrocycle, setSelectedMacrocycle] = useState<number | null>(null);
  const [microcycle, setMicrocycle] = useState<Partial<Microcycle>>({
    number: undefined,
    name: '',
    startDate: new Date(dayjs().toISOString()),
    endDate: new Date(dayjs().add(1, 'week').toISOString()),
    notes: '',
    mesocycleId: undefined,
    sessionGoals: [],
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch macrocycles and microcycle data
  useEffect(() => {
    async function fetchData() {
      try {
        const macroResponse = await fetch('/api/cycles/macrocycles');
        const macroData: Macrocycle[] = await macroResponse.json();
        setMacrocycles(macroData);

        if (isEditing) {
          const response = await fetch(`/api/cycles/microcycles/${microcycleId}`);
          const data: Microcycle = await response.json();
          console.log(data);
          setMicrocycle(data);
          setSelectedMacrocycle(data.mesocycle?.macrocycle?.id || null);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load data.');
      }
    }

    fetchData();
  }, [microcycleId, isEditing]);

  // Fetch mesocycles for selected macrocycle
  useEffect(() => {
    async function fetchMesocycles() {
      if (!selectedMacrocycle) return;
      try {
        const response = await fetch(`/api/cycles/macrocycles/${selectedMacrocycle}/mesocycles`);
        const data: Mesocycle[] = await response.json();
        setMesocycles(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load mesocycles.');
      }
    }

    fetchMesocycles();
  }, [selectedMacrocycle]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing
        ? `/api/cycles/microcycles/${microcycleId}`
        : '/api/cycles/microcycles';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(microcycle),
      });

      if (response.ok) {
        router.push('/utilities/cycles/microcycles');
      } else {
        setError('Failed to save microcycle.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while saving the microcycle.');
    }
  };

  // Handle session-goals updates
  const handleAddSessionGoal = () => {
    setMicrocycle((prev) => ({
      ...prev,
      sessionGoals: [...(prev.sessionGoals || []), { duration: 0, note: '', coach: '' }],
    }));
  };

  const handleSessionGoalChange = (index: number, key: keyof SessionGoal, value: string) => {
    const updatedGoals = [...(microcycle.sessionGoals || [])];
    updatedGoals[index] = { ...updatedGoals[index], [key]: value };
    setMicrocycle((prev) => ({ ...prev, sessionGoals: updatedGoals }));
  };

  const handleRemoveSessionGoal = (index: number) => {
    const updatedGoals = [...(microcycle.sessionGoals || [])];
    updatedGoals.splice(index, 1);
    setMicrocycle((prev) => ({ ...prev, sessionGoals: updatedGoals }));
  };

  return (
    <PageContainer
      title={isEditing ? 'Edit Microcycle' : 'Add Microcycle'}
      description={isEditing ? 'Edit the selected microcycle' : 'Add a new microcycle'}
    >
      <h1>{isEditing ? 'Edit Microcycle' : 'Add Microcycle'}</h1>

      {error && (
        <Typography variant="body1" color="error">
          {error}
        </Typography>
      )}

      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {/* Select Macrocycle */}
          <Select
            value={selectedMacrocycle || ''}
            onChange={(e) => setSelectedMacrocycle(Number(e.target.value))}
            displayEmpty
            required
          >
            <MenuItem value="">
              <em>Select Macrocycle</em>
            </MenuItem>
            {macrocycles.map((macro) => (
              <MenuItem key={macro.id} value={macro.id}>
                {macro.name || `Macrocycle ${macro.number || macro.id}`}
              </MenuItem>
            ))}
          </Select>

          {/* Select Mesocycle */}
          <Select
            value={microcycle.mesocycleId || ''}
            onChange={(e) =>
              setMicrocycle((prev) => ({ ...prev, mesocycleId: Number(e.target.value) }))
            }
            displayEmpty
            required
          >
            <MenuItem value="">
              <em>Select Mesocycle</em>
            </MenuItem>
            {mesocycles.map((meso) => (
              <MenuItem key={meso.id} value={meso.id}>
                {meso.name || `Mesocycle ${meso.number || meso.id}`}
              </MenuItem>
            ))}
          </Select>

          {/* Other Fields */}
          <TextField
            label="Microcycle Number"
            type="number"
            value={microcycle.number || ''}
            onChange={(e) =>
              setMicrocycle((prev) => ({ ...prev, number: Number(e.target.value) }))
            }
            required
          />
          <TextField
            label="Microcycle Name"
            value={microcycle.name || ''}
            onChange={(e) => setMicrocycle((prev) => ({ ...prev, name: e.target.value }))}
          />
          <TextField
            label="Start Date"
            type="date"
            value={microcycle.startDate || ''}
            onChange={(e) => setMicrocycle((prev) => ({ ...prev, startDate: new Date(e.target.value) }))}
            required
          />
          <TextField
            label="End Date"
            type="date"
            value={microcycle.endDate || ''}
            onChange={(e) => setMicrocycle((prev) => ({ ...prev, endDate: new Date(e.target.value) }))}
            required
          />
          <TextField
            label="Notes"
            multiline
            rows={3}
            value={microcycle.notes || ''}
            onChange={(e) => setMicrocycle((prev) => ({ ...prev, notes: e.target.value }))}
          />

          {/* Session Goals */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Session Goals
            </Typography>
            {microcycle.sessionGoals?.map((goal, index) => (
              <Stack key={index} spacing={2} direction="row" alignItems="center">
                <TextField
                  label="Duration"
                  value={goal.duration || ''}
                  onChange={(e) =>
                    handleSessionGoalChange(index, 'duration', e.target.value)
                  }
                  required
                />
                <TextField
                  label="Note"
                  value={goal.note || ''}
                  onChange={(e) => handleSessionGoalChange(index, 'note', e.target.value)}
                />
                <TextField
                  label="Coach"
                  value={goal.coach || ''}
                  onChange={(e) => handleSessionGoalChange(index, 'coach', e.target.value)}
                />
                <IconButton
                  onClick={() => handleRemoveSessionGoal(index)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </Stack>
            ))}
            <Button onClick={handleAddSessionGoal} variant="outlined">
              Add Session Goal
            </Button>
          </Box>

          {/* Submit Button */}
          <Button type="submit" variant="contained" color="primary">
            {isEditing ? 'Update Microcycle' : 'Add Microcycle'}
          </Button>
        </Stack>
      </form>
    </PageContainer>
  );
};

export default ManageMicrocyclePage;
