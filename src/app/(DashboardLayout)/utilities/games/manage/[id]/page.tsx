'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import { Button, Box, Stack, Typography, TextField, Select, MenuItem, CircularProgress } from '@mui/material';
import { Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import dayjs from 'dayjs';
import { SelectChangeEvent } from '@mui/material/Select';

import { GameFormDataInterface, Team, Athlete, GameFormAthletesInterface } from '@/types/games/types';
import { useRef } from 'react';



const GameFormPage = () => {

  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id === 'new' ? null : params?.id; // Get id unconditionally
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<GameFormDataInterface>({
    number: 0,
    date: dayjs().format('YYYY-MM-DDTHH:mm'),
    away: false,
    oponentId: 1, // Set default to empty string
    athletes: [], // Initialize as empty array
    competition: "",
    subcomp: "",
    notes: ""
  });
  const [teams, setTeams] = useState<Team[]>([]);
  const [availableAthletes, setAvailableAthletes] = useState<GameFormAthletesInterface[]>([]);
  const [selectedAthletes, setSelectedAthletes] = useState<GameFormAthletesInterface[]>([]);
  const [success, setSuccess] = useState<string | null>(null);
  const [detailedError, setDetailedError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);

    // Sort athletes by number, year of birth, and name
    const sortAthletes = (athletes: GameFormAthletesInterface[]) => {
      return athletes.sort((a, b) => {
        const numberCompare = parseInt(a.athletes.number) - parseInt(b.athletes.number);
        if (numberCompare !== 0) return numberCompare;

        const yearCompare = dayjs(a.athletes.birthdate).year() - dayjs(b.athletes.birthdate).year();
        if (yearCompare !== 0) return yearCompare;

        return a.athletes.name.localeCompare(b.athletes.name);
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
        const athletes = athletesData.map((athlete) => ({
          number: String(athlete.number), // assuming `number` is a string and needs conversion to number
          athletes: athlete, // embeds the entire athlete object
          period1: false,
          period2: false,
          period3: false,
          period4: false
        }));
        setAvailableAthletes(sortAthletes(athletes));
        // New game so lets return
        if (!id) {
          // only set all athletes as available if it's a new game
          return;
        }

        // Fetch game details
        const gameResponse = await fetch(`/api/games/${id}`);
        if (!gameResponse.ok) {
          throw new Error(`Failed to fetch game details. Status: ${gameResponse.status}`);
        }

        const gameData = await gameResponse.json();
        const gameAthletes = gameData.game.gameAthletes.map((gameAthlete: any) => ({
          athletes: gameAthlete.athletes,  // Access `name` or other properties of the nested `athletes` object
          number: gameAthlete.number === "" ? gameAthlete.athletes.number : gameAthlete.number, // Access `number` directly from `athletes` if it’s stored there
          period1: gameAthlete.period1,
          period2: gameAthlete.period2,
          period3: gameAthlete.period3,
          period4: gameAthlete.period4
        }));

        setForm({
          number: gameData.game.number || 0, // Add this line
          date: dayjs(gameData.game.date).format('YYYY-MM-DDTHH:mm') ?? "",
          away: gameData.game.away ?? false,
          competition: gameData.game.competition ?? "",
          subcomp: gameData.game.subcomp ?? "",
          oponentId: gameData.game.oponentId || '',
          notes: gameData.game.notes ?? "",
          athletes: gameAthletes,
        });

        const available = athletes.filter(
          (athlete: GameFormAthletesInterface) => !gameAthletes.some((selectedAthlete: GameFormAthletesInterface) => selectedAthlete.athletes.id === athlete.athletes.id)
        );

        setAvailableAthletes(sortAthletes(available));
        setSelectedAthletes(sortAthletes(gameAthletes));
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
    const handleAddAthlete = (athlete: GameFormAthletesInterface) => {
      const updatedSelected = [
        ...selectedAthletes,
        { ...athlete, number: athlete.athletes.number === '-1' ? '' : String(athlete.athletes.number) },
      ];
      const updatedAvailable = availableAthletes.filter((a) => a.athletes.id !== athlete.athletes.id);
  
      setSelectedAthletes(sortAthletes(updatedSelected));
      setAvailableAthletes(sortAthletes(updatedAvailable));
      setForm((prev) => ({ ...prev, athletes: [...prev.athletes, athlete] }));

      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 0);
    };
  
    // Remove athlete from selected list
    const handleRemoveAthlete = (athlete: GameFormAthletesInterface) => {
      const updatedAvailable = [...availableAthletes, athlete];
      const updatedSelected = selectedAthletes.filter((a) => a.athletes.id !== athlete.athletes.id);
  
      setAvailableAthletes(sortAthletes(updatedAvailable));
      setSelectedAthletes(sortAthletes(updatedSelected));
      setForm((prev) => ({
        ...prev,
        athletes: prev.athletes.filter((ath) => ath.athletes.id !== athlete.athletes.id),
      }));
    };
  
    // Handle form submission (PUT request)
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);

      try {
        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/games/${id}` : `/api/games`;

        const updateForm = {
          ...form,
          athletes: selectedAthletes
        }
        console.log("Submitting:", JSON.stringify(updateForm));

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
                  <TableRow key={athlete.athletes.id}>
                    <TableCell>
                      <TextField
                        value={athlete.number === "" ? String(athlete.athletes.number) : athlete.number}
                        inputRef={inputRef}
                        onChange={(e) => {
                          const updatedGameNumber = e.target.value;
                          console.log(`changed: ${updatedGameNumber}`);
                          setSelectedAthletes((prev) =>
                            prev.map((a) =>
                              a.athletes.id === athlete.athletes.id
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
                              checked={Boolean(athlete[`period${period}` as keyof GameFormAthletesInterface])} // Cast to key of GameFormAthletesInterface
                              onChange={(e) => {
                                const isChecked = e.target.checked;
                                setSelectedAthletes((prev) =>
                                  prev.map((a) =>
                                    a.athletes.id === athlete.athletes.id
                                      ? { ...a, [`period${period}`]: isChecked }
                                      : a
                                  )
                                );
                              }}
                            />
                            <Typography variant="body2" sx={{ ml: 0.5 }}>P{period}</Typography>
                          </label>
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell>{athlete.athletes.name}</TableCell>
                    <TableCell>{dayjs(athlete.athletes.birthdate).year()}</TableCell>
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
                  <TableRow key={athlete.athletes.id}>
                    <TableCell>{athlete.athletes.number}</TableCell>
                    <TableCell>{athlete.athletes.name}</TableCell>
                    <TableCell>{dayjs(athlete.athletes.birthdate).year()}</TableCell>
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
