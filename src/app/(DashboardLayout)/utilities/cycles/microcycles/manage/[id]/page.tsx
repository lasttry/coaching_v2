'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
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
import SessionGoalsTables from '@/app/(DashboardLayout)/components/shared/SessionGoalsTables';
import {
  MicrocycleInterface,
  MacrocycleInterface,
  MesocycleInterface,
  SessionGoalInterface,
} from '@/types/cycles/types';
import React from 'react';

type Params = Promise<{ id: string }>;

const ManageMicrocyclePage = (props: { params: Params }) => {
  const router = useRouter();
  const params = use(props.params);
  const microcycleId = params?.id;
  console.log(microcycleId);

  const isEditing = microcycleId !== 'new';
  const [macrocycles, setMacrocycles] = useState<MacrocycleInterface[]>([]);
  const [mesocycles, setMesocycles] = useState<MesocycleInterface[]>([]);
  const [selectedMacrocycle, setSelectedMacrocycle] = useState<number | null>(
    null,
  );
  const [microcycle, setMicrocycle] = useState<Partial<MicrocycleInterface>>({
    number: undefined,
    name: '',
    startDate: new Date(dayjs().toISOString()),
    endDate: new Date(dayjs().add(1, 'week').toISOString()),
    notes: '',
    mesocycle: {
      id: 0,
    },
    sessionGoals: [],
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch macrocycles and microcycle data
  useEffect(() => {
    async function fetchData() {
      try {
        const macroResponse = await fetch('/api/cycles/macrocycles');
        const macroData: MacrocycleInterface[] = await macroResponse.json();
        setMacrocycles(macroData);

        if (isEditing) {
          const response = await fetch(
            `/api/cycles/microcycles/${microcycleId}`,
          );
          const data: MicrocycleInterface = await response.json();
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
        const response = await fetch(
          `/api/cycles/macrocycles/${selectedMacrocycle}/mesocycles`,
        );
        const data: MesocycleInterface[] = await response.json();
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
      sessionGoals: [
        ...(prev.sessionGoals || []),
        {
          date: new Date(dayjs(microcycle.startDate).format('YYYY-MM-DD')),
          order: 0,
          duration: 0,
          note: '',
          coach: '',
        },
      ],
    }));
  };

  const handleSessionGoalChange = (
    index: number,
    key: keyof SessionGoalInterface,
    value: string | Date | number,
  ) => {
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
      description={
        isEditing ? 'Edit the selected microcycle' : 'Add a new microcycle'
      }
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
            value={microcycle.mesocycle?.id || ''}
            onChange={(e) =>
              setMicrocycle((prev) => ({
                ...prev,
                mesocycle: mesocycles.find(
                  (mesocycle) => mesocycle.id === Number(e.target.value),
                ),
              }))
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
              setMicrocycle((prev) => ({
                ...prev,
                number: Number(e.target.value),
              }))
            }
            required
          />
          <TextField
            label="Microcycle Name"
            value={microcycle.name || ''}
            onChange={(e) =>
              setMicrocycle((prev) => ({ ...prev, name: e.target.value }))
            }
          />
          <TextField
            label="Start Date"
            type="date"
            value={dayjs(microcycle.startDate).format('YYYY-MM-DD') || ''}
            onChange={(e) =>
              setMicrocycle((prev) => ({
                ...prev,
                startDate: new Date(e.target.value),
              }))
            }
            inputRef={(input) => {
              if (input) {
                input.setAttribute(
                  'min',
                  mesocycles.find((m) => m.id === microcycle.mesocycle?.id)
                    ?.startDate
                    ? dayjs(
                        mesocycles.find(
                          (m) => m.id === microcycle.mesocycle?.id,
                        )?.startDate,
                      ).format('YYYY-MM-DD')
                    : '',
                );
                input.setAttribute(
                  'max',
                  mesocycles.find((m) => m.id === microcycle.mesocycle?.id)
                    ?.endDate
                    ? dayjs(
                        mesocycles.find(
                          (m) => m.id === microcycle.mesocycle?.id,
                        )?.endDate,
                      ).format('YYYY-MM-DD')
                    : '',
                );
              }
            }}
            required
          />
          <TextField
            label="End Date"
            type="date"
            value={dayjs(microcycle.endDate).format('YYYY-MM-DD') || ''}
            onChange={(e) =>
              setMicrocycle((prev) => ({
                ...prev,
                endDate: new Date(e.target.value),
              }))
            }
            inputRef={(input) => {
              if (input) {
                input.setAttribute(
                  'min',
                  mesocycles.find((m) => m.id === microcycle.mesocycle?.id)
                    ?.startDate
                    ? dayjs(
                        mesocycles.find(
                          (m) => m.id === microcycle.mesocycle?.id,
                        )?.startDate,
                      ).format('YYYY-MM-DD')
                    : '',
                );
                input.setAttribute(
                  'max',
                  mesocycles.find((m) => m.id === microcycle.mesocycle?.id)
                    ?.endDate
                    ? dayjs(
                        mesocycles.find(
                          (m) => m.id === microcycle.mesocycle?.id,
                        )?.endDate,
                      ).format('YYYY-MM-DD')
                    : '',
                );
              }
            }}
            required
          />
          <TextField
            label="Notes"
            multiline
            rows={3}
            value={microcycle.notes || ''}
            onChange={(e) =>
              setMicrocycle((prev) => ({ ...prev, notes: e.target.value }))
            }
          />
          <SessionGoalsTables data={microcycle.sessionGoals || []} />
          {/* Session Goals */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Session Goals
            </Typography>
            {microcycle.sessionGoals?.map((goal, index) => (
              <Stack
                key={index}
                spacing={2}
                direction="row"
                alignItems="center"
              >
                <TextField
                  label="Date"
                  type="date"
                  value={dayjs(goal.date).format('YYYY-MM-DD') || ''}
                  onChange={(e) =>
                    handleSessionGoalChange(
                      index,
                      'date',
                      new Date(e.target.value),
                    )
                  }
                  inputRef={(input) => {
                    if (input) {
                      input.setAttribute(
                        'min',
                        dayjs(microcycle.startDate).format('YYYY-MM-DD'),
                      );
                      input.setAttribute(
                        'max',
                        dayjs(microcycle.endDate).format('YYYY-MM-DD'),
                      );
                    }
                  }}
                  required
                />
                <TextField
                  label="Order"
                  value={goal.order || ''}
                  onChange={(e) =>
                    handleSessionGoalChange(
                      index,
                      'order',
                      Number(e.target.value),
                    )
                  }
                  required
                  sx={{ width: '50px' }} // Adjust the width as needed
                />

                <TextField
                  label="Duration"
                  value={goal.duration || ''}
                  onChange={(e) =>
                    handleSessionGoalChange(
                      index,
                      'duration',
                      Number(e.target.value),
                    )
                  }
                  required
                  sx={{ width: '70px' }} // Adjust the width as needed
                />
                <TextField
                  label="Note"
                  value={goal.note || ''}
                  onChange={(e) =>
                    handleSessionGoalChange(index, 'note', e.target.value)
                  }
                  multiline
                  rows={3} // Adjust the number of rows as needed
                  sx={{ width: '450px' }} // Adjust the width as needed
                />
                <TextField
                  label="Coach"
                  value={goal.coach || ''}
                  onChange={(e) =>
                    handleSessionGoalChange(index, 'coach', e.target.value)
                  }
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
