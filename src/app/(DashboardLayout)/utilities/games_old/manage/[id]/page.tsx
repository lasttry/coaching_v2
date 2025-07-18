'use client';
import React, { ReactElement } from 'react';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import {
  Button,
  Box,
  Stack,
  Typography,
  TextField,
  Select,
  MenuItem,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from 'dayjs';
import { SelectChangeEvent } from '@mui/material/Select';

import {
  GameInterface,
  AthleteInterface,
  GameAthleteInterface,
  ObjectiveInterface,
  ObjectiveType,
  OpponentInterface,
} from '@/types/games/types';
import { useRef } from 'react';

type Params = Promise<{ id: string }>;

const GameFormPage = (props: { params: Params }): ReactElement => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<GameInterface>({
    number: 0,
    date: dayjs(new Date()).format('YYYY-MM-DDTHH:mm') ?? new Date(),
    away: false,
    competition: '',
    subcomp: '',
    notes: '',
    gameAthletes: [],
    oponentId: undefined,
    objectives: [], // Add default
  });
  const [opponents, setOpponents] = useState<OpponentInterface[]>([]);
  const [availableAthletes, setAvailableAthletes] = useState<GameAthleteInterface[]>([]);
  const [selectedAthletes, setSelectedAthletes] = useState<GameAthleteInterface[]>([]);
  const [objectives, setObjectives] = useState<ObjectiveInterface[]>([]);
  const [success, setSuccess] = useState<string | null>(null);
  const [detailedError, setDetailedError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const params = use(props.params);
  const gameId = params?.id;
  // Sort athletes by number, year of birth, and name

  const handleAddObjective = (): void => {
    setObjectives([...objectives, { title: '', description: '', type: ObjectiveType.TEAM }]);
  };

  const handleObjectiveChange = (
    index: number,
    field: string,
    value: string | ObjectiveType
  ): void => {
    const updatedObjectives = [...objectives];
    updatedObjectives[index] = {
      ...updatedObjectives[index],
      [field]: value,
    };
    setObjectives(updatedObjectives);
    setForm((prev) => ({ ...prev, objectives: updatedObjectives }));
  };

  const handleRemoveObjective = (index: number): void => {
    const updatedObjectives = [...objectives];
    updatedObjectives.splice(index, 1);
    setObjectives(updatedObjectives);
    setForm((prev) => ({ ...prev, objectives: updatedObjectives }));
  };

  const objectiveTypeLabels: Record<ObjectiveType, string> = {
    TEAM: 'Equipa',
    OFFENSIVE: 'Ofensivo',
    DEFENSIVE: 'Defensivo',
    INDIVIDUAL: 'Individual',
  };

  const sortAthletes = (athletes: GameAthleteInterface[]): GameAthleteInterface[] => {
    return athletes.sort((a, b) => {
      const numberA = a.athlete.number ? parseInt(a.athlete.number, 10) : 0;
      const numberB = b.athlete.number ? parseInt(b.athlete.number, 10) : 0;
      const numberCompare = numberA - numberB;

      if (numberCompare !== 0) return numberCompare;

      const birthdateA = a.athlete.birthdate ? dayjs(a.athlete.birthdate).year() : 0;
      const birthdateB = b.athlete.birthdate ? dayjs(b.athlete.birthdate).year() : 0;
      const yearCompare = birthdateA - birthdateB;

      if (yearCompare !== 0) return yearCompare;

      return a.athlete.name.localeCompare(b.athlete.name);
    });
  };

  // Fetch data if editing (i.e., if id exists)
  useEffect(() => {
    async function fetchData(): Promise<void> {
      try {
        // Fetch available opponents
        const opponentsResponse = await fetch('/api/opponents');
        if (!opponentsResponse.ok) {
          throw new Error(`Failed to fetch opponents. Status: ${opponentsResponse.status}`);
        }
        const opponentsData: OpponentInterface[] = await opponentsResponse.json();
        setOpponents(opponentsData);

        // Fetch athletes
        const athletesResponse = await fetch('/api/athletes');
        if (!athletesResponse.ok) {
          throw new Error(`Failed to fetch athletes. Status: ${athletesResponse.status}`);
        }
        const athletesData: AthleteInterface[] = await athletesResponse.json();
        const athletes = athletesData.map((athlete) => ({
          athlete: athlete,
          number: athlete.number,
          period1: false,
          period2: false,
          period3: false,
          period4: false,
        }));
        setAvailableAthletes(sortAthletes(athletes));
        // New game so lets return
        if (gameId === 'new') {
          return;
        }

        // Fetch game details
        const gameResponse = await fetch(`/api/games/${gameId}`);
        if (!gameResponse.ok) {
          throw new Error(`Failed to fetch game details. Status: ${gameResponse.status}`);
        }

        const gameData = await gameResponse.json();
        const gameAthletes = gameData.game.gameAthletes.map(
          (gameAthlete: GameAthleteInterface) => ({
            athlete: gameAthlete.athlete, // Access `name` or other properties of the nested `athletes` object
            number:
              gameAthlete && gameAthlete.number === ''
                ? gameAthlete.athlete?.number || 0
                : gameAthlete?.number || 0,
            period1: gameAthlete.period1,
            period2: gameAthlete.period2,
            period3: gameAthlete.period3,
            period4: gameAthlete.period4,
          })
        );

        setForm({
          number: gameData.game.number || 0, // Add this line
          date: dayjs(gameData.game.date).format('YYYY-MM-DDTHH:mm') ?? '',
          away: gameData.game.away ?? false,
          competition: gameData.game.competition ?? '',
          subcomp: gameData.game.subcomp ?? '',
          oponentId: gameData.game.oponentId || '',
          notes: gameData.game.notes ?? '',
          gameAthletes: gameAthletes,
        });

        const available = athletes.filter(
          (athlete: GameAthleteInterface) =>
            !gameAthletes.some(
              (gameAthlete: GameAthleteInterface) => gameAthlete.athlete.id === athlete.athlete.id
            )
        );
        setAvailableAthletes(sortAthletes(available));
        setSelectedAthletes(sortAthletes(gameAthletes));

        setObjectives(gameData.game.objectives);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data. Please try again later.');
        setDetailedError(err instanceof Error ? err.message : String(err));
      }
    }

    fetchData();
  }, [gameId]);

  // Handle input change for form fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Select input change for opponent (oponentId)
  const handleSelectChange = (e: SelectChangeEvent<string | number>): void => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add athlete to selected list
  const handleAddAthlete = (athlete: GameAthleteInterface): void => {
    const updatedSelected = [
      ...selectedAthletes,
      {
        ...athlete,
        number: athlete.athlete.number === '-1' ? '' : String(athlete.athlete.number),
      },
    ];
    const updatedAvailable = availableAthletes.filter((a) => a.athlete.id !== athlete.athlete.id);

    setSelectedAthletes(sortAthletes(updatedSelected));
    setAvailableAthletes(sortAthletes(updatedAvailable));
    setForm((prev) => ({
      ...prev,
      gameAthletes: [...prev.gameAthletes, athlete],
    }));

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 0);
  };

  // Remove athlete from selected list
  const handleRemoveAthlete = (athlete: GameAthleteInterface): void => {
    const updatedAvailable = [...availableAthletes, athlete];
    const updatedSelected = selectedAthletes.filter((a) => a.athlete.id !== athlete.athlete.id);

    setAvailableAthletes(sortAthletes(updatedAvailable));
    setSelectedAthletes(sortAthletes(updatedSelected));
    setForm((prev) => ({
      ...prev,
      gameAthletes: prev.gameAthletes.filter((ath) => ath.athlete.id !== athlete.athlete.id),
    }));
  };

  // Handle form submission (PUT request)
  const handleSubmit = async (e: React.FormEvent): void => {
    e.preventDefault();
    setLoading(true);

    try {
      const method = gameId !== 'new' ? 'PUT' : 'POST';
      const url = gameId !== 'new' ? `/api/games/${gameId}` : `/api/games`;

      const updateForm = {
        ...form,
        gameAthletes: selectedAthletes,
        objectives: objectives,
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateForm),
      });

      if (response.ok) {
        setSuccess('Game updated successfully.');
        setError(null);
        setDetailedError(null);
        setTimeout(() => {
          router.push('/utilities/games');
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update game.');
        setDetailedError(JSON.stringify(errorData, null, 2));
      }
    } catch (err) {
      setError('An unknown error occurred.');
      setDetailedError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <PageContainer
      title={gameId ? 'Edit Game' : 'Create Game'}
      description={gameId ? 'Edit Game' : 'Create Game'}
    >
      <h1>{gameId ? 'Edit Game' : 'Create Game'}</h1>

      {error ? (
        <Typography variant="body1" sx={{ color: (theme) => theme.palette.error.main }}>
          {error}
        </Typography>
      ) : (
        <></>
      )}

      {detailedError ? (
        <Typography
          variant="body1"
          sx={{
            color: (theme) => theme.palette.error.main,
            whiteSpace: 'pre-wrap',
          }}
        >
          {detailedError}
        </Typography>
      ) : (
        <></>
      )}

      {success ? (
        <Typography variant="body1" sx={{ color: 'green' }}>
          {success}
        </Typography>
      ) : (
        <></>
      )}

      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {/* Number Field */}
          <TextField
            label="Game Number"
            type="number"
            name="number"
            value={form?.number || ''}
            onChange={(e) => handleChange(e as React.ChangeEvent<HTMLInputElement>)}
            required
          />
          {/* Date Field */}
          <TextField
            label="Game Date"
            type="datetime-local"
            name="date"
            value={form?.date}
            onChange={(e) => handleChange(e as React.ChangeEvent<HTMLInputElement>)}
            required
          />

          {/* Away Game Toggle */}
          <Box>
            <Select
              name="away"
              value={form?.away ? 'true' : 'false'}
              onChange={(e) => handleSelectChange(e as React.ChangeEvent<HTMLInputElement>)}
            >
              <MenuItem value="false">Home</MenuItem>
              <MenuItem value="true">Away</MenuItem>
            </Select>
          </Box>

          {/* Opponent Select */}
          <Select
            name="oponentId"
            value={opponents.length > 0 ? form?.oponentId || '' : ''}
            onChange={handleSelectChange}
            displayEmpty
          >
            <MenuItem value="">
              <em>Select Opponent</em>
            </MenuItem>
            {opponents.map((team) => (
              <MenuItem key={team.id} value={team.id}>
                {team.name}
              </MenuItem>
            ))}
          </Select>

          {/* Competition Field */}
          <TextField
            label="Competition"
            name="competition"
            value={form?.competition}
            onChange={(e) => handleChange(e as React.ChangeEvent<HTMLInputElement>)}
          />

          {/* Subcompetition Field */}
          <TextField
            label="Subcompetition"
            name="subcomp"
            value={form?.subcomp || ''}
            onChange={(e) => handleChange(e as React.ChangeEvent<HTMLInputElement>)}
          />

          {/* Notes Field */}
          <TextField
            label="Notes"
            name="notes"
            value={form?.notes || ''}
            multiline
            rows={4}
            onChange={(e) => handleChange(e as React.ChangeEvent<HTMLInputElement>)}
          />
          <Box marginY={4}>
            <Typography variant="h6" gutterBottom>
              Objectives
            </Typography>
            {objectives.map((objective, index) => (
              <Box key={`objective-${index}`} display="flex" flexDirection="column" mb={2}>
                <TextField
                  fullWidth
                  value={objective.title}
                  onChange={(e) => handleObjectiveChange(index, 'title', e.target.value)}
                  placeholder={`Objective Title ${index + 1}`}
                  label="Title"
                  margin="normal"
                />
                <TextField
                  fullWidth
                  value={objective.description}
                  onChange={(e) => handleObjectiveChange(index, 'description', e.target.value)}
                  placeholder={`Objective Description ${index + 1}`}
                  label="Description"
                  margin="normal"
                  multiline
                  rows={3}
                />
                <Select
                  value={objective.type}
                  onChange={(e) =>
                    handleObjectiveChange(index, 'type', e.target.value as ObjectiveType)
                  }
                  displayEmpty
                >
                  {Object.values(ObjectiveType).map((type) => (
                    <MenuItem key={type} value={type}>
                      {objectiveTypeLabels[type]}
                    </MenuItem>
                  ))}
                </Select>
                <IconButton
                  onClick={() => handleRemoveObjective(index)}
                  color="error"
                  sx={{ alignSelf: 'flex-end' }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            <Button variant="outlined" onClick={handleAddObjective} sx={{ mt: 2 }}>
              Add Objective
            </Button>
          </Box>

          {/* Athlete Table */}
          <Box marginY={4}>
            <Typography variant="h6" gutterBottom>
              Athletes (Selected: {selectedAthletes.length})
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Number</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Birth Year</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Selected athletes */}
                {selectedAthletes.map((athlete) => (
                  <TableRow key={athlete.athlete.id}>
                    <TableCell>
                      <TextField
                        value={
                          athlete.number === '' ? String(athlete.athlete.number) : athlete.number
                        }
                        inputRef={inputRef}
                        onChange={(e) => {
                          const updatedGameNumber = e.target.value;
                          setSelectedAthletes((prev) =>
                            prev.map((a) =>
                              a.athlete.id === athlete.athlete.id
                                ? { ...a, number: updatedGameNumber }
                                : a
                            )
                          );
                        }}
                      />

                      {/* Period Checkboxes */}
                      <Stack direction="row" spacing={1} marginTop={1}>
                        {[1, 2, 3, 4].map((period) => (
                          <label key={`period-${period}`}>
                            <input
                              type="checkbox"
                              checked={Boolean(
                                athlete[`period${period}` as keyof GameAthleteInterface]
                              )} // Cast to key of GameFormAthletesInterface
                              onChange={(e) => {
                                const isChecked = e.target.checked;
                                setSelectedAthletes((prev) =>
                                  prev.map((a) =>
                                    a.athlete.id === athlete.athlete.id
                                      ? { ...a, [`period${period}`]: isChecked }
                                      : a
                                  )
                                );
                              }}
                            />
                            <Typography variant="body2" sx={{ ml: 0.5 }}>
                              P{period}
                            </Typography>
                          </label>
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell>{athlete.athlete.name}</TableCell>
                    <TableCell>{dayjs(athlete.athlete.birthdate).year()}</TableCell>
                    <TableCell>Selected</TableCell>
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => handleRemoveAthlete(athlete)}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {/* Available athletes */}
                {availableAthletes.map((athlete) => (
                  <TableRow key={athlete.athlete.id}>
                    <TableCell>{athlete.athlete.number}</TableCell>
                    <TableCell>{athlete.athlete.name}</TableCell>
                    <TableCell>{dayjs(athlete.athlete.birthdate).year()}</TableCell>
                    <TableCell>Available</TableCell>
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleAddAthlete(athlete)}
                      >
                        Add
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>

          {/* Buttons */}
          <Box display="flex" justifyContent="space-between">
            <Button type="submit" variant="contained" color="primary">
              Save Changes
            </Button>
            <Button
              type="button"
              variant="outlined"
              color="secondary"
              onClick={() => router.push('/utilities/games')}
            >
              Cancel
            </Button>
          </Box>
        </Stack>
      </form>
    </PageContainer>
  );
};

export default GameFormPage;
