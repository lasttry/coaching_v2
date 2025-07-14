'use client';

import React, { useEffect, useState } from 'react';
import {
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  SelectChangeEvent,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
  Box,
} from '@mui/material';
import { Grid } from '@mui/material';
import {
  AthleteInterface,
  GameAthleteInterface,
  GameAthleteReport,
  GameInterface,
  ObjectiveInterface,
  OpponentInterface,
} from '@/types/games/types';
import { log } from '@/lib/logger';
import { useTranslation } from 'react-i18next';
import { useSession } from 'next-auth/react';
import { CompetitionInterface, CompetitionSerieInterface } from '@/types/competition/types';
import { TeamInterface } from '@/types/teams/types';
import { ClubInterface, VenueInterface } from '@/types/club/types';

interface GameProps {
  game: GameInterface;
  setGame: React.Dispatch<React.SetStateAction<GameInterface>>;
  setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>;
  setSuccessMessage: React.Dispatch<React.SetStateAction<string | null>>;
  onSave: (game: GameInterface) => void;
  onCancel?: () => void;
  saveText?: string;
}

const GameComponent: React.FC<GameProps> = ({
  game,
  setGame,
  setErrorMessage,
  setSuccessMessage,
  onSave,
  onCancel,
  saveText,
}) => {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [competitions, setCompetitions] = React.useState<CompetitionInterface[]>([]);
  const [teams, setTeams] = useState<TeamInterface[]>([]);
  const [opponents, setOpponents] = React.useState<OpponentInterface[]>([]);
  const [teamAthletes, setTeamAthletes] = useState<AthleteInterface[]>([]);
  const [gameAthletes, setGameAthletes] = useState<GameAthleteInterface[]>([]);
  const [clubVenues, setClubVenues] = useState<VenueInterface[]>([]);
  const [opponentVenues, setOpponentVenues] = useState<VenueInterface[]>([]);


  const selectedCompetition = competitions.find((comp) => comp.id === game.competitionId);
  const seriesOptions = selectedCompetition?.competitionSeries ?? [];

  const filteredTeams = selectedCompetition
    ? teams.filter((team) => team.echelonId === selectedCompetition.echelonId)
    : [];

  React.useEffect(() => {
    const fetchCompetitions = async (): Promise<void> => {
      try {
        const response = await fetch('/api/competition');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch competitions');
        }

        setCompetitions(data); // assuming the API returns array of { id, name }
      } catch (error) {
        log.error('Error fetching competitions:', error);
        setErrorMessage('Failed to load competitions.');
      }
    };

    fetchCompetitions();
  }, [setErrorMessage]);

  React.useEffect(() => {
    const fetchOpponents = async (): Promise<void> => {
      try {
        const response = await fetch('/api/opponents');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch opponents');
        }

        setOpponents(data);
      } catch (error) {
        log.error('Error fetching opponents:', error);
        setErrorMessage('Failed to load opponents.');
      }
    };

    fetchOpponents();
  }, [setErrorMessage]);

  React.useEffect(() => {
    const fetchTeams = async (): Promise<void> => {
      try {
        const response = await fetch('/api/teams');
        const data = await response.json();

        if (!response.ok) throw new Error(data.error || 'Failed to fetch teams');

        setTeams(data);
      } catch (error) {
        log.error('Error fetching teams:', error);
        setErrorMessage('Failed to load teams.');
      }
    };

    fetchTeams();
  }, [setErrorMessage]);

  React.useEffect(() => {
    const fetchTeamAthletes = async (): Promise<void> => {
      if (!game?.team?.id) {
        setTeamAthletes([]);
        return;
      }
  
      try {
        const response = await fetch(`/api/teams/${game.team.id}`);
        const data = await response.json();
  
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch team data');
        }
  
        setTeamAthletes(
          data.athletes.map((a: { athlete: AthleteInterface }) => a.athlete)
        );
      } catch (err) {
        log.error('Error fetching team athletes:', err);
        setErrorMessage('Failed to load team athletes.');
      }
    };
  
    fetchTeamAthletes();
  }, [game?.team?.id, setErrorMessage]);

  useEffect(() => {
    if (teamAthletes?.length > 0) {
      setGameAthletes(
        teamAthletes.map((athlete) => {
          const selected = game.gameAthletes?.find((g) => g.athleteId === athlete.id);
  
          return {
            athleteId: athlete.id,
            athlete,
            gameId: game.id,
            game: game,
            name: athlete.name,
            number: selected?.number || athlete.number || '',
            selected: !!selected,
            period1: selected?.period1 || false,
            period2: selected?.period2 || false,
            period3: selected?.period3 || false,
            period4: selected?.period4 || false,
          };
        })
      );
    }
  }, [teamAthletes, game]);

  useEffect(() => {
    const fetchVenues = async (): Promise<void> => {
      try {
        if (!game.away ) {
          const res = await fetch(`/api/clubs/${Number(session?.user.selectedClubId)}`);
          const data = await res.json();
          const venues = data.venues ?? [];
          setClubVenues(venues);
          if (venues.length > 0 && !game.venueId) {
            setGame((prev) => ({ ...prev, venueId: venues[0].id }));
          }
        } else if (game.away && game.opponentId) {
          const res = await fetch(`/api/opponents/${game.opponentId}`);
          const data = await res.json();
          const venues = data.venues ?? [];
          setOpponentVenues(venues);
          if (venues.length > 0 && !game.venueId) {
            setGame((prev) => ({ ...prev, venueId: venues[0].id }));
          } 
        }
      } catch (error) {
        log.error('Error fetching venues:', error);
        setErrorMessage('Failed to load venues.');
      }
    };
  
    fetchVenues();
  }, [game.away, game.clubId, game.opponentId, setErrorMessage]);

  const validateField = (
    field: string,
    value:
      | string
      | number
      | boolean
      | Date
      | null
      | undefined
      | CompetitionInterface
      | TeamInterface
      | ClubInterface
      | CompetitionSerieInterface
      | GameAthleteReport[]
      | OpponentInterface
      | GameAthleteInterface[]
      | ObjectiveInterface[]
  ): string => {
    let error = '';
    setErrorMessage('');
    setSuccessMessage('');

    switch (field) {
      case 'number':
        if (value === null || value === undefined || isNaN(Number(value)) || Number(value) <= 0) {
          error = t('NumberMustBePositive');
        }
        break;

      case 'date':
        if (!value) {
          error = t('DateIsRequired');
        } else {
          const date = new Date(String(value));
          if (isNaN(date.getTime())) {
            error = t('DateIsInvalid');
          } else {
            const isoString = date.toISOString();
            const timePart = isoString.split('T')[1]?.slice(0, 5);
            if (!timePart || timePart === '00:00') {
              error = t('TimeIsRequired');
            }
          }
        }
        break;

      case 'away':
        if (typeof value !== 'boolean') {
          error = t('AwayMustBeBoolean');
        }
        break;

      case 'notes':
        if (typeof value === 'string' && value.length > 1000) {
          error = t('NotesCannotExceed1000Characters');
        }
        break;

      case 'clubId':
        if (!value || isNaN(Number(value))) {
          setGame((prev) => ({
            ...prev,
            clubId: Number(session?.user.selectedClubId),
          }));
        }
        break;

      case 'competitionId':
        if (!value || isNaN(Number(value))) {
          error = t('CompetitionIdIsRequired');
        }
        break;

      case 'competitionSerieId':
        if (!value || isNaN(Number(value))) {
          error = t('CompetitionSerieIdIsRequired');
        }
        break;

      case 'teamId':
        if (!value || isNaN(Number(value))) {
          error = t('TeamIdIsRequired');
        }
        break;

      case 'opponentId':
        if (!value || isNaN(Number(value))) {
          error = t('OpponentIdIsRequired');
        }
        break;

      default:
        break;
    }

    if (error) log.error(error);
    return error;
  };

  const validateAllFields = (): string[] => {
    const errors: Record<string, string> = {};

    // Use keyof CompetitionInterface to type the field correctly
    (Object.keys(game) as Array<keyof GameInterface>).forEach((field) => {
      const error = validateField(field, game[field]);
      if (error) {
        errors[field] = error;
      }
    });

    setValidationErrors(errors);

    return Object.values(errors).filter((err) => err !== '');
  };

  const handleCancelGame = (): void => {
    if(onCancel) onCancel();
  }

  // Handle Add Competition
  const handleSaveGame = (): undefined => {
    if (validateAllFields().length > 0) {
      return;
    }
     // Only pass selected athletes to game.gameAthletes
    const filtered = gameAthletes.filter((a) => a.selected);

    const updatedGame: GameInterface = {
      ...game,
      gameAthletes: filtered,
    };
    log.debug(updatedGame);
    if (onSave) {
      onSave(updatedGame);
    }
  };

  const handleSelectChange = (field: string) => (e: SelectChangeEvent<string | null>) => {
    const value = e.target.value;
    const error = validateField(field, value);
    setValidationErrors((prev) => ({ ...prev, [field]: error }));

    if (field === 'competition') {
      const selected = competitions.find((comp) => comp.id === value);
      if (selected === undefined) {
        return;
      }
      const firstSerieId = selected?.competitionSeries?.[0]?.id ?? null;
      const firstTeam = teams.filter((team) => team.echelonId === selected.echelonId)[0] ?? null;

      setGame((prev) => ({
        ...prev,
        competition: selected,
        competitionId: Number(selected.id),
        competitionSerieId: Number(firstSerieId),
        teamId: firstTeam.id ?? undefined,
        team: firstTeam ?? undefined,
        gameAthletes: [],
      }));

    } else {
      setGame((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const error = validateField(field, value);
    setValidationErrors((prev) => ({ ...prev, [field]: error }));
    setGame((prev) => ({ ...prev, [field]: value }));
  };
  const handleCheckboxChange = (field: string, checked: boolean): void => {
    setGame((prev) => ({
      ...prev,
      [field]: checked,
    }));
  };

  const handleAthleteFieldChange = (
    id: number | null,
    field: keyof GameAthleteInterface,
    value: string | boolean
  ): void => {
    if (id === null) {
      log.warn('handleAthleteFieldChange > id is null.');
      return;
    }
  
    setGameAthletes((prev) =>
      prev.map((a) =>
        a.athleteId === id
          ? {
              ...a,
              [field]: value,
              // if field isn't 'selected', mark athlete as selected
              ...(field !== 'selected' ? { selected: true } : {}),
            }
          : a
      )
    );
  };

  const handleUpdateInfos = async (): Promise<void> => {
    if (game.number === undefined || game.number === null) {
      return;
    }
    try {
      const response = await fetch(`/api/fpb/game-officials/${game.number}`);
      const data = await response.json();
  
      if (!response.ok) throw new Error(data.error || 'Failed to fetch game details');
  
      log.debug(data);
      setGame({
        ...game,
        refereeMain: data.refereeMain,
        referee1: data.referee1,
        shotClock: data.shotClock,
        scorer: data.scorer,
        timekeeper: data.timekeeper,
      })
      // You can now do something with `data`, like updating the game state
    } catch (error) {
      log.error('Error fetching game officials:', error);
      setErrorMessage('Failed to load game officials.');
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label={t('number')}
          value={game.number ?? ''}
          onChange={handleChange('number')}
          error={!!validationErrors['number']}
          helperText={validationErrors['number']}
          type="number"
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label={t('date')}
          type="datetime-local"
          value={
            game.date
              ? `${new Date(game.date).getFullYear()}-${String(new Date(game.date).getMonth() + 1).padStart(2, '0')}-${String(new Date(game.date).getDate()).padStart(2, '0')}T${String(new Date(game.date).getHours()).padStart(2, '0')}:${String(new Date(game.date).getMinutes()).padStart(2, '0')}`
              : ''
          }
          onChange={handleChange('date')}
          error={!!validationErrors['date']}
          helperText={validationErrors['date']}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={game.away}
              onChange={(e) => handleCheckboxChange('away', e.target.checked)}
            />
          }
          label={t('away')}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormControl fullWidth>
          <InputLabel>{t('venue')}</InputLabel>
          <Select
            value={game.venueId ?? ''}
            onChange={(e) =>
              setGame((prev) => ({
                ...prev,
                venueId: Number(e.target.value),
              }))
            }
            label={t('venue')}
            disabled={
              game.away ? opponentVenues.length === 0 : clubVenues.length === 0
            }
          >
            {(game.away ? opponentVenues : clubVenues).map((venue) => (
              <MenuItem key={venue.id} value={Number(venue.id)}>
                {venue.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <FormControl fullWidth error={!!validationErrors['competition']}>
          <InputLabel>{t('competition')}</InputLabel>
          <Select
            value={game.competitionId === undefined ? '' : String(game.competitionId)}
            onChange={handleSelectChange('competition')}
            label={t('competition')}
          >
            <MenuItem value="">{t('selectCompetition')}</MenuItem>
            {competitions.map((comp) => (
              <MenuItem key={comp.id} value={comp.id ?? ''}>
                {comp.name}
              </MenuItem>
            ))}
          </Select>
          {validationErrors['competitionId'] && (
            <Typography variant="body2" color="error">
              {validationErrors['competitionId']}
            </Typography>
          )}
        </FormControl>
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormControl fullWidth>
          <InputLabel>{t('series')}</InputLabel>
          <Select
            value={game.competitionSerieId ?? ''}
            onChange={(e) =>
              setGame((prev) => ({
                ...prev,
                competitionSerieId: Number(e.target.value),
              }))
            }
            label={t('series')}
            disabled={!selectedCompetition}
          >
            {seriesOptions.map((serie) => (
              <MenuItem key={serie.id} value={String(serie.id)}>
                {serie.name}
              </MenuItem>
            ))}
          </Select>
          {validationErrors['competitionSerieId'] && (
            <Typography variant="body2" color="error">
              {validationErrors['competitionSerieId']}
            </Typography>
          )}
        </FormControl>
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormControl fullWidth>
          <InputLabel>{t('team')}</InputLabel>
          <Select
            value={game.teamId ?? ''}
            onChange={(e) =>
              setGame((prev) => ({
                ...prev,
                teamId: Number(e.target.value),
                team: teams.find((team) => team.id === Number(e.target.value)),
                gameAthletes: []
              }))
            }
            label={t('team')}
            disabled={!selectedCompetition}
          >
            <MenuItem value="">{t('selectTeam')}</MenuItem>
            {filteredTeams.map((team) => (
              <MenuItem key={team.id} value={team.id ?? ''}>
                {team.name}
              </MenuItem>
            ))}
          </Select>
          {validationErrors['teamId'] && (
            <Typography variant="body2" color="error">
              {validationErrors['teamId']}
            </Typography>
          )}
        </FormControl>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TextField
          fullWidth
          label={t('notes')}
          value={game.notes ?? ''}
          onChange={handleChange('notes')}
          error={!!validationErrors['notes']}
          helperText={validationErrors['notes']}
          multiline
          rows={4}
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <FormControl fullWidth error={!!validationErrors['opponentId']}>
          <InputLabel>{t('opponent')}</InputLabel>
          <Select
            value={game.opponentId ?? ''}
            onChange={(e) =>
              setGame((prev) => ({
                ...prev,
                opponentId: Number(e.target.value),
                opponent: opponents.find((opponent) => opponent.id === Number(e.target.value)),
              }))
            }
            label={t('opponent')}
            renderValue={(selected) => {
              const opponent = opponents.find((o) => o.id === Number(selected));
              return opponent ? opponent.name : '';
            }}
          >
            {opponents.map((opponent) => (
              <MenuItem key={opponent.id} value={opponent.id}>
                <Grid container alignItems="center" spacing={1}>
                  <Grid>
                    {opponent.image && (
                      <img
                        src={opponent.image}
                        alt={opponent.name}
                        width={30}
                        height={30}
                        style={{ borderRadius: '50%' }}
                      />
                    )}
                  </Grid>
                  <Grid>
                    <Typography>{opponent.name}</Typography>
                  </Grid>
                </Grid>
              </MenuItem>
            ))}
          </Select>
          {validationErrors['opponentId'] && (
            <Typography variant="body2" color="error">
              {validationErrors['opponentId']}
            </Typography>
          )}
        </FormControl>
      </Grid>

      <Box mt={2}>
        <Typography variant="h6">{t('Athletes')}</Typography>
        {gameAthletes.map((athlete) => (
          <Grid container key={athlete.athleteId} spacing={2} alignItems="center" sx={{ mb: 1 }}>
            <Grid size={1}>
              <Checkbox
                checked={athlete.selected ?? false}
                disabled={!athlete.selected && gameAthletes.filter(a => a.selected).length >= 12}
                onChange={(e) => handleAthleteFieldChange(athlete.athleteId, 'selected', e.target.checked)}
              />
            </Grid>
            <Grid size={3}>
              <Typography>{athlete.athlete?.name}</Typography>
            </Grid>
            <Grid size={2}>
              <TextField
                label="Number"
                value={athlete.number}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^$|^0$|^00$|^[1-9]$|^[1-9][0-9]$/.test(value)) {
                    handleAthleteFieldChange(athlete.athleteId, 'number', value);
                  }
                }}
                inputProps={{ maxLength: 2 }}
                disabled={!athlete.selected}
              />
            </Grid>
            {[1, 2, 3, 4].map((p) => (
              <Grid size={1} key={p}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={athlete[`period${p}` as keyof GameAthleteInterface] as boolean}
                      onChange={(e) =>
                        handleAthleteFieldChange(
                          athlete.athleteId,
                          `period${p}` as keyof GameAthleteInterface,
                          e.target.checked
                        )
                      }
                      disabled={!athlete.selected}
                    />
                  }
                  label={`P${p}`}
                />
              </Grid>
            ))}
          </Grid>
        ))}
      </Box>

      <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button variant='contained' onClick={handleUpdateInfos}>
          {t('getInfos')}
        </Button>
        <Button variant="contained" onClick={handleSaveGame}>
          {t(saveText ? saveText : 'Add')}
        </Button>
        <Button variant="outlined" onClick={handleCancelGame} sx={{ marginLeft: 2 }}>
          {t('Cancel')}
        </Button>
      </Grid>
    </Grid>
  );
};

GameComponent.displayName = 'GameComponent';
export default GameComponent;
