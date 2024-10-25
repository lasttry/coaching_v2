'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import { Button, Box, Stack, Typography, TextField, Select, MenuItem, CircularProgress } from '@mui/material';
import { Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import dayjs from 'dayjs';
import { SelectChangeEvent } from '@mui/material/Select';

import { GameFormData, Team, Athlete } from '@/types/games/types';

const GameFormPage = () => {

  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id === 'new' ? null : params?.id; // Get id unconditionally
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<GameFormData>({
    date: dayjs().format('YYYY-MM-DDTHH:mm'),
    away: false,
    oponentId: '', // Set default to empty string
    athleteIds: [], // Initialize as empty array
  });
  const [teams, setTeams] = useState<Team[]>([]);
  const [availableAthletes, setAvailableAthletes] = useState<Athlete[]>([]);
  const [selectedAthletes, setSelectedAthletes] = useState<Athlete[]>([]);
  const [success, setSuccess] = useState<string | null>(null);
  const [detailedError, setDetailedError] = useState<string | null>(null);

  // Sort athletes by number, year of birth, and name
  const sortAthletes = (athletes: Athlete[]) => {
    return athletes.sort((a, b) => {
      const numberCompare = parseInt(a.number) - parseInt(b.number);
      if (numberCompare !== 0) return numberCompare;

      const yearCompare = dayjs(a.birthdate).year() - dayjs(b.birthdate).year();
      if (yearCompare !== 0) return yearCompare;

      return a.name.localeCompare(b.name);
    });
  };

  // Fetch data if editing (i.e., if id exists)
  useEffect(() => {
      async function fetchData() {
        console.log(id)
        try {
          // Fetch available teams
          const teamsResponse = await fetch('/api/teams');
          if (!teamsResponse.ok) {
            throw new Error(`Failed to fetch teams. Status: ${teamsResponse.status}`);
          }
          const teamsData: Team[] = await teamsResponse.json();
          setTeams(teamsData);
          console.log(`teams set ${teamsData}`)
    
          // Fetch athletes
          const athletesResponse = await fetch('/api/athletes');
          if (!athletesResponse.ok) {
            throw new Error(`Failed to fetch athletes. Status: ${athletesResponse.status}`);
          }
          const athletesData: Athlete[] = await athletesResponse.json();

          // New game so lets return
          if (!id) {
            // only set all athletes as available if it's a new game
            setAvailableAthletes(sortAthletes(athletesData));
            return;
          }

          // Fetch game details
          const gameResponse = await fetch(`/api/games/${id}`);
  
          if (!gameResponse.ok) {
            throw new Error(`Failed to fetch game details. Status: ${gameResponse.status}`);
          }
  
          const gameData = await gameResponse.json();
  
          setForm({
            number: gameData.game.number || undefined, // Add this line
            date: dayjs(gameData.game.date).format('YYYY-MM-DDTHH:mm'),
            away: gameData.game.away,
            competition: gameData.game.competition,
            subcomp: gameData.game.subcomp,
            oponentId: gameData.game.oponentId || '', 
            notes: gameData.game.notes,
            athleteIds: gameData.game.gameAthletes.map((athlete: { athleteId: number }) => athlete.athleteId) 
          });
    
          const selected = athletesData.filter((athlete: Athlete) =>
            gameData.game.gameAthletes?.some((selectedAthlete: { athleteId: number }) => selectedAthlete.athleteId === athlete.id)
          );
    
          const available = athletesData.filter(
            (athlete: Athlete) => !selected.some((selectedAthlete: Athlete) => selectedAthlete.id === athlete.id)
          );
    
          setAvailableAthletes(sortAthletes(available));
          setSelectedAthletes(sortAthletes(selected));
        } catch (err) {
          console.error('Error fetching data:', err);
          setError('Failed to fetch data. Please try again later.');
          setDetailedError(err instanceof Error ? err.message : String(err));
        }
      }
    
      fetchData();
  }, [id]);

    // Handle input change for form fields
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
    };
  
    // Handle Select input change for opponent (oponentId)
    const handleSelectChange = (e: SelectChangeEvent<string | number>) => {
      const { name, value } = e.target;
      console.log(`${name}:${value}`)
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    };
  
    // Add athlete to selected list
    const handleAddAthlete = (athlete: Athlete) => {
      const updatedSelected = [...selectedAthletes, athlete];
      const updatedAvailable = availableAthletes.filter((a) => a.id !== athlete.id);
  
      setSelectedAthletes(sortAthletes(updatedSelected));
      setAvailableAthletes(sortAthletes(updatedAvailable));
      setForm((prev) => ({ ...prev, athleteIds: [...prev.athleteIds, athlete.id] }));
    };
  
    // Remove athlete from selected list
    const handleRemoveAthlete = (athlete: Athlete) => {
      const updatedAvailable = [...availableAthletes, athlete];
      const updatedSelected = selectedAthletes.filter((a) => a.id !== athlete.id);
  
      setAvailableAthletes(sortAthletes(updatedAvailable));
      setSelectedAthletes(sortAthletes(updatedSelected));
      setForm((prev) => ({
        ...prev,
        athleteIds: prev.athleteIds.filter((id) => id !== athlete.id),
      }));
    };
  
    // Handle form submission (PUT request)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const method = id ? 'PUT' : 'POST'; // Use POST for create, PUT for update
      const url = id ? `/api/games/${id}` : '/api/games';
  
      // Ensure that the number is converted to an integer (or left as undefined if empty)
      const updatedForm = {
        ...form,
        number: form.number ? parseInt(form.number as unknown as string, 10) : undefined,
      };

      console.log(JSON.stringify(updatedForm))
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedForm),
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
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <PageContainer title={id ? 'Edit Game' : 'Create Game'} description={id ? 'Edit Game' : 'Create Game'}>
      <h1>{id ? 'Edit Game' : 'Create Game'}</h1>

      {error ? (
        <Typography variant="body1" sx={{ color: (theme) => theme.palette.error.main }}>
          {error}
        </Typography>
      ) : <></>}

      {detailedError ? (
        <Typography variant="body1" sx={{ color: (theme) => theme.palette.error.main, whiteSpace: 'pre-wrap' }}>
          {detailedError}
        </Typography>
      ) : <></>}

      {success ? (
        <Typography variant="body1" sx={{ color: 'green' }}>
          {success}
        </Typography>
      ) : <></>}

      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {/* Number Field */}
          <TextField
            label="Game Number"
            type="number"
            name="number"
            value={form.number || ''}
            onChange={(e) => handleChange(e as React.ChangeEvent<HTMLInputElement>)} 
            required
          />
          {/* Date Field */}
          <TextField
            label="Game Date"
            type="datetime-local"
            name="date"
            value={form.date}
            onChange={(e) => handleChange(e as React.ChangeEvent<HTMLInputElement>)} 
            required
          />

          {/* Away Game Toggle */}
          <Box>
            <Select
              name="away"
              value={form.away ? "true" : "false"}
              onChange={(e) => handleSelectChange(e as React.ChangeEvent<HTMLInputElement>)}
            >
              <MenuItem value="false">Home</MenuItem>
              <MenuItem value="true">Away</MenuItem>
            </Select>
          </Box>

          {/* Opponent Select */}
          <Select
            name="oponentId"
            value={teams.length > 0 ? form.oponentId : ''}
            onChange={handleSelectChange}
            displayEmpty
          >
            <MenuItem value="">
              <em>Select Opponent</em>
            </MenuItem>
            {teams.map((team) => (
              <MenuItem key={team.id} value={team.id}>
                {team.name}
              </MenuItem>
            ))}
          </Select>

          {/* Competition Field */}
          <TextField
            label="Competition"
            name="competition"
            value={form.competition || ''}
            onChange={(e) => handleChange(e as React.ChangeEvent<HTMLInputElement>)}
          />

          {/* Subcompetition Field */}
          <TextField
            label="Subcompetition"
            name="subcomp"
            value={form.subcomp || ''}
            onChange={(e) => handleChange(e as React.ChangeEvent<HTMLInputElement>)}
          />

          {/* Notes Field */}
          <TextField
            label="Notes"
            name="notes"
            value={form.notes || ''}
            multiline
            rows={4}
            onChange={(e) => handleChange(e as React.ChangeEvent<HTMLInputElement>)}
          />

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
                  <TableRow key={athlete.id}>
                    <TableCell>{athlete.number}</TableCell>
                    <TableCell>{athlete.name}</TableCell>
                    <TableCell>{dayjs(athlete.birthdate).year()}</TableCell>
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
                  <TableRow key={athlete.id}>
                    <TableCell>{athlete.number}</TableCell>
                    <TableCell>{athlete.name}</TableCell>
                    <TableCell>{dayjs(athlete.birthdate).year()}</TableCell>
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
            <Button type="button" variant="outlined" color="secondary" onClick={() => router.push('/utilities/games')}>
              Cancel
            </Button>
          </Box>
        </Stack>
      </form>
    </PageContainer>
  );

};

export default GameFormPage;
