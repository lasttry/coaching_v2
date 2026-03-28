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
  GameAthleteInterface,
  GameAthleteReport,
  GameInterface,
  ObjectiveInterface,
  SizeEnum,
} from '@/types/game/types';
import { AthleteInterface } from '@/types/athlete/type';
import { log } from '@/lib/logger';
import { useTranslation } from 'react-i18next';
import { useSession } from 'next-auth/react';
import { CompetitionInterface, CompetitionSerieInterface } from '@/types/competition/types';
import { TeamInterface } from '@/types/teams/types';
import { ClubInterface } from '@/types/club/types';
import { VenueInterface } from '@/types/venues/types';
import { generateVsBanner } from '@/utils/generateVsBanner';
import { GameEquipmentInterface } from '@/types/gameEquipment/type';
import { OpponentInterface } from '@/types/opponent/type';
import { EquipmentInterface } from '@/types/equipment/type';

interface BannerTeam {
  image: string;
  name: string;
  isClub: boolean;
}

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
  const [venues, setVenues] = useState<VenueInterface[]>([]);
  const [equipments, setEquipments] = useState<EquipmentInterface[]>([]);
  const [selectedEquipmentColor, setSelectedEquipmentColor] = useState<string>('');
  const [gameEquipments, setGameEquipments] = useState<GameEquipmentInterface[]>([]);
  const selectedOpponent = opponents.find((o) => o.id === game.opponentId);
  const [club, setClub] = useState<ClubInterface | null>(null);

  const [bannerHomeTeam, setBannerHomeTeam] = useState<BannerTeam | null>(null);
  const [bannerAwayTeam, setBannerAwayTeam] = useState<BannerTeam | null>(null);

  const selectedCompetition = competitions.find((comp) => comp.id === game.competitionId);
  const seriesOptions = selectedCompetition?.competitionSeries ?? [];

  const filteredTeams = selectedCompetition
    ? teams.filter((team) => team.echelonId === selectedCompetition.echelonId)
    : [];

  const distinctEquipmentColors = React.useMemo(
    () =>
      Array.from(
        new Set(equipments.map((eq) => eq.color).filter((c): c is string => Boolean(c)))
      ).sort(),
    [equipments]
  );

  useEffect(() => {
    if (Array.isArray(game.gameEquipments)) {
      setGameEquipments(game.gameEquipments);
    } else {
      setGameEquipments([]);
    }
  }, [game.gameEquipments]);

  useEffect(() => {
    const fetchEquipments = async (): Promise<void> => {
      if (!session?.user?.selectedClubId || !session?.user?.selectedSeasonId) {
        setEquipments([]);
        return;
      }

      try {
        const res = await fetch(
          `/api/clubs/${Number(session.user.selectedClubId)}/seasons/${Number(
            session.user.selectedSeasonId
          )}/equipments`
        );
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch equipments');
        }

        setEquipments(data);
      } catch (error) {
        log.error('Error fetching equipments:', error);
        setErrorMessage('Failed to load equipments.');
        setEquipments([]);
      }
    };

    fetchEquipments();
  }, [session?.user?.selectedClubId, session?.user?.selectedSeasonId, setErrorMessage]);

  useEffect(() => {
    async function fetchClub(): Promise<void> {
      try {
        if (!session?.user?.selectedClubId) {
          return;
        }

        const clubResponse = await fetch(`/api/clubs/${session.user.selectedClubId}`);
        const clubData = await clubResponse.json();

        if (clubResponse.ok) {
          setClub(clubData);
        } else {
          const clubErrorText = `Failed to fetch club data: ${clubData.error || 'Unknown error'}`;
          log.error(clubErrorText);
        }
      } catch (error) {
        let errorText: string;

        if (error instanceof Error) {
          errorText = `Error fetching club data: ${error.message}`;
        } else {
          errorText = 'An unknown error occurred while fetching club data.';
        }

        log.error(errorText);
      }
    }

    fetchClub();
  }, [session]);

  useEffect(() => {
    if (!club || !selectedOpponent) {
      setBannerHomeTeam(null);
      setBannerAwayTeam(null);
      return;
    }

    const clubName = club.shortName || club.name || t('home');
    const opponentName = selectedOpponent.shortName || t('opponent');

    if (game.away) {
      // jogo fora: adversário é equipa da casa
      setBannerHomeTeam({
        image: selectedOpponent.image ?? '/images/logos/logo-dark.svg',
        name: opponentName,
        isClub: false,
      });
      setBannerAwayTeam({
        image: club.image || '/images/logos/logo-dark.svg',
        name: clubName,
        isClub: true,
      });
    } else {
      // jogo em casa: clube é equipa da casa
      setBannerHomeTeam({
        image: club.image || '/images/logos/logo-dark.svg',
        name: clubName,
        isClub: true,
      });
      setBannerAwayTeam({
        image: selectedOpponent.image ?? '/images/logos/logo-dark.svg',
        name: opponentName,
        isClub: false,
      });
    }
  }, [club, selectedOpponent, game.away, t]);

  const handleDownloadBanner = async (): Promise<void> => {
    if (!bannerHomeTeam || !bannerAwayTeam) {
      return;
    }

    try {
      const dataUrl = await generateVsBanner(bannerHomeTeam, bannerAwayTeam);

      const link = document.createElement('a');
      const homeNameSafe = bannerHomeTeam.name.replace(/\s+/g, '_').toLowerCase();
      const awayNameSafe = bannerAwayTeam.name.replace(/\s+/g, '_').toLowerCase();

      link.download = `${homeNameSafe}-vs-${awayNameSafe}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      log.error('Error generating banner image:', error);
    }
  };

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

        setTeamAthletes(data.athletes.map((a: { athlete: AthleteInterface }) => a.athlete));
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
  }, [teamAthletes]);

  useEffect(() => {
    const fetchVenues = async (): Promise<void> => {
      try {
        let url: string | null = null;

        if (!game.away) {
          // Home game → use club venues
          if (!session?.user.selectedClubId) return;
          url = `/api/clubs/${Number(session.user.selectedClubId)}`;
        } else if (game.away && game.opponentId) {
          // Away game → use opponent venues
          url = `/api/opponents/${game.opponentId}`;
        }

        if (!url) {
          setVenues([]);
          setGame((prev) => ({ ...prev, venueId: null }));
          return;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch venues');

        const data = await res.json();
        const venues = data.venues ?? [];

        setVenues(venues);

        // auto-pick first venue if none selected or invalid
        setGame((prev) => {
          if (!venues.length) return { ...prev, venueId: null };
          if (!prev.venueId || !venues.find((v: VenueInterface) => v.id === prev.venueId)) {
            return { ...prev, venueId: venues[0].id };
          }
          return prev;
        });
      } catch (error) {
        log.error('Error fetching venues:', error);
        setErrorMessage('Failed to load venues.');
        setVenues([]);
      }
    };

    fetchVenues();
  }, [game.away, game.opponentId, session?.user.selectedClubId, setErrorMessage, setGame]);

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
      | VenueInterface
      | GameEquipmentInterface[]
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
    if (onCancel) onCancel();
  };

  // Handle Add Competition
  const handleSaveGame = (): undefined => {
    if (validateAllFields().length > 0) {
      return;
    }
    // Só atletas selecionados
    const filtered = gameAthletes.filter((a) => a.selected);

    const updatedGame = {
      ...game,
      gameAthletes: filtered,
      gameEquipments,
    } as GameInterface;

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

    if (field === 'selected' && value === false) {
      //setGameEquipments((prev) => prev.filter((ge) => ge.athleteId === id ? false : true));
      setGame((prev) => ({
        ...prev,
        gameEquipments: (prev.gameEquipments ?? []).filter((ge) =>
          ge.athleteId === id ? false : true
        ),
      }));
    }
    setGameAthletes((prev) =>
      prev.map((a) =>
        a.athleteId === id
          ? {
              ...a,
              [field]: value,
              // se não for o campo 'selected', marca como selecionado
              ...(field !== 'selected' ? { selected: true } : {}),
              ...(field === 'selected' && !value ? { number: '0' } : {}),
              ...(field === 'selected' && !value ? { period1: false } : {}),
              ...(field === 'selected' && !value ? { period2: false } : {}),
              ...(field === 'selected' && !value ? { period3: false } : {}),
              ...(field === 'selected' && !value ? { period4: false } : {}),
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
      });
      // You can now do something with `data`, like updating the game state
    } catch (error) {
      log.error('Error fetching game officials:', error);
      setErrorMessage('Failed to load game officials.');
    }
  };

  // Helper to rank sizes: XS < S < M < L < XL < XXL, undefined = very large
  const sizeRank = (size?: SizeEnum): number => {
    switch (size) {
      case SizeEnum.S:
        return 1;
      case SizeEnum.M:
        return 2;
      case SizeEnum.L:
        return 3;
      case SizeEnum.XL:
        return 4;
      case SizeEnum.XXL:
        return 5;
      default:
        return 999;
    }
  };

  const handleAssignEquipment = (): void => {
    if (!selectedEquipmentColor) {
      setErrorMessage(t('equipment.selectColorFirst'));
      return;
    }

    const availableForColor = equipments.filter((eq) => eq.color === selectedEquipmentColor);
    if (!availableForColor.length) {
      setErrorMessage(t('equipment.noEquipmentForColor'));
      return;
    }

    const selectedAthletes = gameAthletes.filter((a) => a.selected);
    if (!selectedAthletes.length) {
      setErrorMessage(t('equipment.noSelectedAthletes'));
      return;
    }

    // First pass: try to assign by preferred numbers (ascending preference)
    const usedEquipmentIds = new Set<number>();
    const assignments: GameEquipmentInterface[] = [];
    const athleteAssigned: Record<number, boolean> = {};
    const athleteNumberAssignments: Record<number, number> = {};

    selectedAthletes.forEach((athlete) => {
      const preferredNumbers = athlete.athlete?.preferredNumbers;
      let assigned = false;
      if (Array.isArray(preferredNumbers) && preferredNumbers.length > 0) {
        // Sort preferred numbers by ascending preference and number
        const sortedPrefs = [...preferredNumbers].sort(
          (a, b) => (a.preference ?? 0) - (b.preference ?? 0) || (a.number ?? 0) - (b.number ?? 0)
        );
        for (const pref of sortedPrefs) {
          for (const eq of availableForColor) {
            if (!eq.id) {
              continue;
            }
            if (
              eq.number === pref.number &&
              sizeRank(eq.size) >= sizeRank(athlete.athlete?.shirtSize) &&
              !usedEquipmentIds.has(eq.id)
            ) {
              if (!athlete.athleteId) {
                continue;
              }
              assignments.push({
                gameId: game.id ?? 0,
                athleteId: athlete.athleteId,
                equipmentId: eq.id,
              });
              usedEquipmentIds.add(eq.id);
              athleteAssigned[athlete.athleteId] = true;
              athleteNumberAssignments[athlete.athleteId] = eq.number;
              assigned = true;
              break;
            }
          }
          if (assigned) break;
        }
      }
    });

    // Second pass: assign to remaining selected athletes by size
    // Get athletes still not assigned, sort by shirt size smallest to largest
    const remainingAthletes = selectedAthletes
      .filter((athlete) => !athleteAssigned[Number(athlete.athleteId)])
      .sort((a, b) => sizeRank(a.athlete?.shirtSize) - sizeRank(b.athlete?.shirtSize));
    // Get available equipments of color not yet assigned, sort by size smallest to largest
    const remainingEquipments = availableForColor
      .filter((eq) => !usedEquipmentIds.has(eq.id))
      .sort((a, b) => sizeRank(a.size) - sizeRank(b.size));

    for (const athlete of remainingAthletes) {
      // Find first equipment at least as big as athlete's shirt size
      const eq = remainingEquipments.find(
        (e) => sizeRank(e.size) >= sizeRank(athlete.athlete?.shirtSize)
      );
      if (eq) {
        assignments.push({
          gameId: game.id ?? 0,
          athleteId: Number(athlete.athleteId),
          equipmentId: eq.id,
        });
        usedEquipmentIds.add(eq.id);
        athleteNumberAssignments[Number(athlete.athleteId)] = eq.number;
        // Remove from remainingEquipments
        const idx = remainingEquipments.findIndex((e) => e.id === eq.id);
        if (idx !== -1) remainingEquipments.splice(idx, 1);
        athleteAssigned[Number(athlete.athleteId)] = true;
      }
    }

    // Guardar atribuições também no objeto `game`
    setGame((prev) => ({
      ...prev,
      gameEquipments: assignments,
    }));

    // Atualizar o número dos atletas com o número do equipamento atribuído
    setGameAthletes((prev) =>
      prev.map((ga) => {
        const assignedNumber = athleteNumberAssignments[Number(ga.athleteId)];
        if (assignedNumber !== undefined) {
          return {
            ...ga,
            number: String(assignedNumber),
            selected: true,
          };
        }

        // Para quem não foi selecionado, número passa a '0'
        if (!ga.selected) {
          return {
            ...ga,
            number: '0',
          };
        }

        return ga;
      })
    );

    setGameEquipments(assignments);
    if (assignments.length < selectedAthletes.length) {
      setErrorMessage(t('equipment.notEnoughForAll'));
    } else {
      setSuccessMessage(t('equipment.assignedToSelected'));
    }
  };

  const sourceGameEquipments = game.gameEquipments ?? gameEquipments;

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            my: 3,
            gap: 2,
            px: 3,
            py: 2,
            borderRadius: 3,
            background: 'radial-gradient(circle at top, #333 0, #111 45%, #000 100%)',
            boxShadow: '0 0 25px rgba(0,0,0,0.7)',
          }}
        >
          {bannerHomeTeam && bannerAwayTeam && (
            <>
              {/* Lado da equipa da casa (ou adversário se jogo for fora) */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <img
                  src={bannerHomeTeam.image}
                  alt={bannerHomeTeam.name}
                  width={72}
                  height={72}
                  style={{
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #ccc',
                    boxShadow: '0 0 10px rgba(255,255,255,0.2)',
                  }}
                />
                <Typography variant="subtitle1" sx={{ mt: 1, color: '#ffffff' }}>
                  {bannerHomeTeam.name}
                </Typography>
              </Box>

              {/* VS com glow no meio */}
              <Box sx={{ px: 1 }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 900,
                    letterSpacing: 4,
                    color: '#ffffff',
                    textShadow:
                      '0 0 6px rgba(255,140,0,0.9), 0 0 14px rgba(255,69,0,0.85), 0 0 24px rgba(255,69,0,0.6)',
                    transform: 'scale(1.1)',
                  }}
                >
                  VS
                </Typography>
              </Box>

              {/* Lado da equipa visitante (ou clube se jogo for fora) */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <img
                  src={bannerAwayTeam.image}
                  alt={bannerAwayTeam.name}
                  width={72}
                  height={72}
                  style={{
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #ccc',
                    boxShadow: '0 0 10px rgba(255,255,255,0.2)',
                  }}
                />
                <Typography variant="subtitle1" sx={{ mt: 1, color: '#ffffff' }}>
                  {bannerAwayTeam.name}
                </Typography>
              </Box>
            </>
          )}
        </Box>

        {/* Botão para download */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <button
            type="button"
            onClick={handleDownloadBanner}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Download imagem
          </button>
        </Box>
      </Grid>

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
          >
            {venues.map((venue) => (
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
                gameAthletes: [],
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
        {gameAthletes.map((athlete) => {
          const assignment = sourceGameEquipments.find((ge) => ge.athleteId === athlete.athleteId);
          const assignedEquipment = assignment
            ? equipments.find((eq) => eq.id === assignment.equipmentId)
            : undefined;

          return (
            <Grid container key={athlete.athleteId} spacing={2} alignItems="center" sx={{ mb: 1 }}>
              <Grid size={1}>
                <Checkbox
                  checked={athlete.selected ?? false}
                  disabled={
                    !athlete.selected && gameAthletes.filter((a) => a.selected).length >= 12
                  }
                  onChange={(e) =>
                    handleAthleteFieldChange(athlete.athleteId, 'selected', e.target.checked)
                  }
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
              <Grid size={2}>
                <Typography variant="body2">
                  {assignedEquipment
                    ? `${assignedEquipment.color} #${assignedEquipment.number} (${assignedEquipment.size})`
                    : t('equipment.notAssigned')}
                </Typography>
              </Grid>
            </Grid>
          );
        })}
      </Box>

      <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
        <Typography variant="h6">{t('equipment.title')}</Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth>
              <InputLabel>{t('equipment.color')}</InputLabel>
              <Select
                value={selectedEquipmentColor}
                label={t('equipment.color')}
                onChange={(e) => setSelectedEquipmentColor(e.target.value as string)}
              >
                <MenuItem value="">{t('equipment.selectColor')}</MenuItem>
                {distinctEquipmentColors.map((color) => (
                  <MenuItem key={color} value={color}>
                    {color}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Button
              variant="contained"
              onClick={handleAssignEquipment}
              disabled={!selectedEquipmentColor || !equipments.length}
            >
              {t('equipment.assignToSelected')}
            </Button>
          </Grid>
        </Grid>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Typography variant="h6">Images</Typography>

        {[1, 2, 3, 4].map((idx) => {
          const imageKey = `image${idx}` as keyof GameInterface;
          return (
            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Button variant="outlined" component="label">
                Upload image {idx}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setGame((prev) => ({
                        ...prev,
                        [imageKey]: reader.result as string,
                      }));
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </Button>

              {game[imageKey] && (
                <img
                  src={(game[imageKey] as string) || ''}
                  alt={`image ${idx}`}
                  width={128}
                  height={90}
                  style={{
                    marginLeft: '10px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                  }}
                />
              )}
            </Box>
          );
        })}
      </Grid>
      <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button variant="contained" onClick={handleUpdateInfos}>
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
