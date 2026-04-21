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
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Avatar,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  SelectAll as SelectAllIcon,
  Deselect as DeselectIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Grid } from '@mui/material';
import {
  GameAthleteInterface,
  GameAthleteReport,
  GameInterface,
  ObjectiveInterface,
} from '@/types/game/types';
import { Size } from '@prisma/client';
import { AthleteInterface } from '@/types/athlete/types';
import { log } from '@/lib/logger';
import { useTranslation } from 'react-i18next';
import { useSession } from 'next-auth/react';
import { CompetitionInterface, CompetitionSerieInterface } from '@/types/competition/types';
import { TeamInterface } from '@/types/teams/types';
import { ClubInterface } from '@/types/club/types';
import { VenueInterface } from '@/types/venues/types';
import { generateVsBanner } from '@/utils/generateVsBanner';
import { GameEquipmentInterface, EquipmentAssignmentIssue } from '@/types/gameEquipment/types';
import { OpponentInterface } from '@/types/opponent/types';
import { EquipmentInterface, EquipmentColorBasicInterface } from '@/types/equipment/types';
import WarningIcon from '@mui/icons-material/Warning';

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
  const [gameEquipments, setGameEquipments] = useState<GameEquipmentInterface[]>([]);
  const [equipmentIssues, setEquipmentIssues] = useState<EquipmentAssignmentIssue[]>([]);
  const [manualOverrides, setManualOverrides] = useState<Set<string>>(new Set());
  const selectedOpponent = opponents.find((o) => o.id === game.opponentId);
  const [club, setClub] = useState<ClubInterface | null>(null);

  const [bannerHomeTeam, setBannerHomeTeam] = useState<BannerTeam | null>(null);
  const [bannerAwayTeam, setBannerAwayTeam] = useState<BannerTeam | null>(null);

  const selectedCompetition = competitions.find((comp) => comp.id === game.competitionId);
  const seriesOptions = selectedCompetition?.competitionSeries ?? [];

  const filteredTeams = selectedCompetition
    ? teams.filter((team) => team.echelonId === selectedCompetition.echelonId)
    : [];

  // Helper functions to get valid Select values (avoid MUI warnings for out-of-range values)
  const getValidCompetitionId = (): string => {
    if (game.competitionId === undefined) return '';
    return competitions.some((c) => c.id === game.competitionId) ? String(game.competitionId) : '';
  };

  const getValidSerieId = (): number | '' => {
    if (!game.competitionSerieId) return '';
    return seriesOptions.some((s) => s.id === game.competitionSerieId)
      ? game.competitionSerieId
      : '';
  };

  const getValidTeamId = (): number | '' => {
    if (!game.teamId) return '';
    return filteredTeams.some((t) => t.id === game.teamId) ? game.teamId : '';
  };

  const getValidOpponentId = (): number | '' => {
    if (!game.opponentId) return '';
    return opponents.some((o) => o.id === game.opponentId) ? game.opponentId : '';
  };

  const getValidVenueId = (): number | '' => {
    if (!game.venueId) return '';
    return venues.some((v) => v.id === game.venueId) ? game.venueId : '';
  };

  const distinctEquipmentColors = React.useMemo(() => {
    const colorMap = new Map<string, { colorHex: string; colorId: number }>();
    equipments.forEach((eq) => {
      if (eq.color && !colorMap.has(eq.color)) {
        colorMap.set(eq.color, {
          colorHex: eq.colorHex || '#000000',
          colorId: eq.equipmentColorId,
        });
      }
    });
    return Array.from(colorMap.entries())
      .map(([color, { colorHex, colorId }]) => ({ color, colorHex, colorId }))
      .sort((a, b) => a.color.localeCompare(b.color));
  }, [equipments]);

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

    const clubName = club.shortName || club.name || t('game.home');
    const opponentName = selectedOpponent.shortName || t('opponent.singular');

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

  const selectedAthletesCount = React.useMemo(
    () => gameAthletes.filter((a) => a.selected).length,
    [gameAthletes]
  );

  useEffect(() => {
    if (selectedAthletesCount > 0 && distinctEquipmentColors.length > 0) {
      autoAssignAllEquipments(gameAthletes);
    }
  }, [selectedAthletesCount, distinctEquipmentColors.length]);

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
      case 'date':
        if (!value) {
          error = t('validation.dateRequired');
        } else {
          const date = new Date(String(value));
          if (isNaN(date.getTime())) {
            error = t('validation.dateInvalid');
          } else {
            const isoString = date.toISOString();
            const timePart = isoString.split('T')[1]?.slice(0, 5);
            if (!timePart || timePart === '00:00') {
              error = t('validation.timeRequired');
            }
          }
        }
        break;

      case 'away':
        if (typeof value !== 'boolean') {
          error = t('validation.awayBoolean');
        }
        break;

      case 'notes':
        if (typeof value === 'string' && value.length > 1000) {
          error = t('validation.notesMaxLength');
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
          error = t('validation.competitionRequired');
        }
        break;

      case 'competitionSerieId':
        if (!value || isNaN(Number(value))) {
          error = t('validation.competitionSerieRequired');
        }
        break;

      case 'teamId':
        if (!value || isNaN(Number(value))) {
          error = t('validation.teamRequired');
        }
        break;

      case 'opponentId':
        if (!value || isNaN(Number(value))) {
          error = t('validation.opponentRequired');
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
  const sizeRank = (size?: Size): number => {
    switch (size) {
      case Size.S:
        return 1;
      case Size.M:
        return 2;
      case Size.L:
        return 3;
      case Size.XL:
        return 4;
      case Size.XXL:
        return 5;
      default:
        return 999;
    }
  };

  const assignEquipmentForColor = (
    colorName: string,
    colorId: number,
    selectedAthletes: GameAthleteInterface[],
    existingAssignments: GameEquipmentInterface[]
  ): { assignments: GameEquipmentInterface[]; issues: EquipmentAssignmentIssue[] } => {
    const colorNameLower = colorName.toLowerCase().trim();
    const availableForColor = equipments.filter(
      (eq) => eq.color?.toLowerCase().trim() === colorNameLower
    );

    const assignments: GameEquipmentInterface[] = [];
    const issues: EquipmentAssignmentIssue[] = [];

    if (!availableForColor.length) {
      selectedAthletes.forEach((athlete) => {
        if (athlete.athleteId) {
          issues.push({
            athleteId: athlete.athleteId,
            athleteName: athlete.athlete?.name || '',
            colorId,
            colorName,
            reason: 'no_equipment_available',
          });
        }
      });
      return { assignments, issues };
    }

    const sortedAthletes = [...selectedAthletes].sort(
      (a, b) => sizeRank(a.athlete?.shirtSize) - sizeRank(b.athlete?.shirtSize)
    );

    const usedEquipmentIds = new Set<number>();
    const athleteAssigned: Record<number, boolean> = {};

    const sortedEquipments = [...availableForColor].sort((a, b) => {
      const sizeCompare = sizeRank(a.size) - sizeRank(b.size);
      if (sizeCompare !== 0) return sizeCompare;
      return a.number - b.number;
    });

    for (const athlete of sortedAthletes) {
      if (!athlete.athleteId) continue;

      const overrideKey = `${athlete.athleteId}-${colorId}`;
      const existingManual = existingAssignments.find(
        (ge) =>
          ge.athleteId === athlete.athleteId && ge.equipmentColorId === colorId && ge.manualOverride
      );

      if (existingManual && manualOverrides.has(overrideKey)) {
        assignments.push(existingManual);
        if (existingManual.equipmentId) {
          usedEquipmentIds.add(existingManual.equipmentId);
        }
        athleteAssigned[athlete.athleteId] = true;
        continue;
      }
    }

    for (const athlete of sortedAthletes) {
      if (!athlete.athleteId || athleteAssigned[athlete.athleteId]) continue;

      const preferredNumbers = athlete.athlete?.preferredNumbers;
      if (!Array.isArray(preferredNumbers) || preferredNumbers.length === 0) {
        continue;
      }

      const preferredForColor = preferredNumbers.find(
        (p) => p.color?.toLowerCase().trim() === colorNameLower
      );

      if (!preferredForColor) continue;

      const matchingEquipment = sortedEquipments.find(
        (eq) => eq.id && eq.number === preferredForColor.number && !usedEquipmentIds.has(eq.id)
      );

      if (matchingEquipment && matchingEquipment.id) {
        assignments.push({
          gameId: game.id ?? 0,
          athleteId: athlete.athleteId,
          equipmentId: matchingEquipment.id,
          equipmentColorId: colorId,
          manualOverride: false,
        });
        usedEquipmentIds.add(matchingEquipment.id);
        athleteAssigned[athlete.athleteId] = true;
        log.debug(
          `[${colorName}] Assigned preferred #${matchingEquipment.number} to ${athlete.athlete?.name}`
        );
      }
    }

    const remainingAthletes = sortedAthletes.filter(
      (athlete) => !athleteAssigned[Number(athlete.athleteId)]
    );

    const remainingEquipments = sortedEquipments.filter(
      (eq) => eq.id && !usedEquipmentIds.has(eq.id)
    );

    for (const athlete of remainingAthletes) {
      if (!athlete.athleteId) continue;

      const equipmentIndex = remainingEquipments.findIndex(
        (eq) => sizeRank(eq.size) >= sizeRank(athlete.athlete?.shirtSize)
      );

      if (equipmentIndex !== -1) {
        const eq = remainingEquipments[equipmentIndex];
        if (eq.id) {
          assignments.push({
            gameId: game.id ?? 0,
            athleteId: athlete.athleteId,
            equipmentId: eq.id,
            equipmentColorId: colorId,
            manualOverride: false,
          });
          usedEquipmentIds.add(eq.id);
          athleteAssigned[athlete.athleteId] = true;
          remainingEquipments.splice(equipmentIndex, 1);
          log.debug(
            `[${colorName}] Assigned #${eq.number} (${eq.size}) to ${athlete.athlete?.name} (size: ${athlete.athlete?.shirtSize})`
          );
        }
      } else {
        issues.push({
          athleteId: athlete.athleteId,
          athleteName: athlete.athlete?.name || '',
          colorId,
          colorName,
          reason: 'no_size_available',
        });
      }
    }

    return { assignments, issues };
  };

  const autoAssignAllEquipments = React.useCallback(
    (athletes: GameAthleteInterface[]): void => {
      const selectedAthletes = athletes.filter((a) => a.selected);
      if (!selectedAthletes.length || !distinctEquipmentColors.length) {
        setGameEquipments([]);
        setEquipmentIssues([]);
        setGame((prev) => ({ ...prev, gameEquipments: [] }));
        return;
      }

      const existingAssignments = game.gameEquipments ?? [];
      const allAssignments: GameEquipmentInterface[] = [];
      const allIssues: EquipmentAssignmentIssue[] = [];

      for (const { color, colorId } of distinctEquipmentColors) {
        const { assignments, issues } = assignEquipmentForColor(
          color,
          colorId,
          selectedAthletes,
          existingAssignments
        );
        allAssignments.push(...assignments);
        allIssues.push(...issues);
      }

      setGameEquipments(allAssignments);
      setEquipmentIssues(allIssues);
      setGame((prev) => ({ ...prev, gameEquipments: allAssignments }));

      if (allIssues.length > 0) {
        log.warn(`Equipment issues found for ${allIssues.length} athlete/color combinations`);
      }
    },
    [distinctEquipmentColors, equipments, game.gameEquipments, game.id, manualOverrides]
  );

  const handleManualEquipmentChange = (
    athleteId: number,
    colorId: number,
    newEquipmentId: number | null
  ): void => {
    const overrideKey = `${athleteId}-${colorId}`;

    const newManualOverrides = new Set(manualOverrides);
    if (newEquipmentId === null) {
      newManualOverrides.delete(overrideKey);
    } else {
      newManualOverrides.add(overrideKey);
    }
    setManualOverrides(newManualOverrides);

    const updatedEquipments = gameEquipments.filter(
      (ge) => !(ge.athleteId === athleteId && ge.equipmentColorId === colorId)
    );

    if (newEquipmentId !== null) {
      updatedEquipments.push({
        gameId: game.id ?? 0,
        athleteId,
        equipmentId: newEquipmentId,
        equipmentColorId: colorId,
        manualOverride: true,
      });
    }

    const selectedAthletes = gameAthletes.filter((a) => a.selected);
    const allAssignments: GameEquipmentInterface[] = [];
    const allIssues: EquipmentAssignmentIssue[] = [];

    for (const { color, colorId: cId } of distinctEquipmentColors) {
      const colorNameLower = color.toLowerCase().trim();
      const availableForColor = equipments.filter(
        (eq) => eq.color?.toLowerCase().trim() === colorNameLower
      );

      if (!availableForColor.length) {
        selectedAthletes.forEach((athlete) => {
          if (athlete.athleteId) {
            allIssues.push({
              athleteId: athlete.athleteId,
              athleteName: athlete.athlete?.name || '',
              colorId: cId,
              colorName: color,
              reason: 'no_equipment_available',
            });
          }
        });
        continue;
      }

      const sortedAthletes = [...selectedAthletes].sort(
        (a, b) => sizeRank(a.athlete?.shirtSize) - sizeRank(b.athlete?.shirtSize)
      );

      const usedEquipmentIds = new Set<number>();
      const athleteAssigned: Record<number, boolean> = {};

      const sortedEquipments = [...availableForColor].sort((a, b) => {
        const sizeCompare = sizeRank(a.size) - sizeRank(b.size);
        if (sizeCompare !== 0) return sizeCompare;
        return a.number - b.number;
      });

      for (const athlete of sortedAthletes) {
        if (!athlete.athleteId) continue;

        const oKey = `${athlete.athleteId}-${cId}`;
        const existingManual = updatedEquipments.find(
          (ge) =>
            ge.athleteId === athlete.athleteId &&
            ge.equipmentColorId === cId &&
            (ge.manualOverride || newManualOverrides.has(oKey))
        );

        if (existingManual && newManualOverrides.has(oKey)) {
          allAssignments.push(existingManual);
          if (existingManual.equipmentId) {
            usedEquipmentIds.add(existingManual.equipmentId);
          }
          athleteAssigned[athlete.athleteId] = true;
        }
      }

      for (const athlete of sortedAthletes) {
        if (!athlete.athleteId || athleteAssigned[athlete.athleteId]) continue;

        const preferredNumbers = athlete.athlete?.preferredNumbers;
        if (!Array.isArray(preferredNumbers) || preferredNumbers.length === 0) {
          continue;
        }

        const preferredForColor = preferredNumbers.find(
          (p) => p.color?.toLowerCase().trim() === colorNameLower
        );

        if (!preferredForColor) continue;

        const matchingEquipment = sortedEquipments.find(
          (eq) => eq.id && eq.number === preferredForColor.number && !usedEquipmentIds.has(eq.id)
        );

        if (matchingEquipment && matchingEquipment.id) {
          allAssignments.push({
            gameId: game.id ?? 0,
            athleteId: athlete.athleteId,
            equipmentId: matchingEquipment.id,
            equipmentColorId: cId,
            manualOverride: false,
          });
          usedEquipmentIds.add(matchingEquipment.id);
          athleteAssigned[athlete.athleteId] = true;
        }
      }

      const remainingAthletes = sortedAthletes.filter(
        (athlete) => !athleteAssigned[Number(athlete.athleteId)]
      );

      const remainingEquipments = sortedEquipments.filter(
        (eq) => eq.id && !usedEquipmentIds.has(eq.id)
      );

      for (const athlete of remainingAthletes) {
        if (!athlete.athleteId) continue;

        const equipmentIndex = remainingEquipments.findIndex(
          (eq) => sizeRank(eq.size) >= sizeRank(athlete.athlete?.shirtSize)
        );

        if (equipmentIndex !== -1) {
          const eq = remainingEquipments[equipmentIndex];
          if (eq.id) {
            allAssignments.push({
              gameId: game.id ?? 0,
              athleteId: athlete.athleteId,
              equipmentId: eq.id,
              equipmentColorId: cId,
              manualOverride: false,
            });
            usedEquipmentIds.add(eq.id);
            athleteAssigned[athlete.athleteId] = true;
            remainingEquipments.splice(equipmentIndex, 1);
          }
        } else {
          allIssues.push({
            athleteId: athlete.athleteId,
            athleteName: athlete.athlete?.name || '',
            colorId: cId,
            colorName: color,
            reason: 'no_size_available',
          });
        }
      }
    }

    setGameEquipments(allAssignments);
    setEquipmentIssues(allIssues);
    setGame((prev) => ({ ...prev, gameEquipments: allAssignments }));
  };

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

      {/* Row 1: Date/Time */}
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label={t('common.date')}
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
        <TextField
          fullWidth
          type="number"
          label={t('opponent.resultsCount')}
          value={game.opponentResultsCount ?? 5}
          onChange={(e) =>
            setGame((prev) => ({
              ...prev,
              opponentResultsCount: Number(e.target.value) || 5,
            }))
          }
          slotProps={{ htmlInput: { min: 0, max: 20 } }}
          helperText={t('opponent.resultsCountHelper')}
        />
      </Grid>

      {/* Row 2: Competition, Series */}
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormControl fullWidth error={!!validationErrors['competition']}>
          <InputLabel>{t('competition.singular')}</InputLabel>
          <Select
            value={getValidCompetitionId()}
            onChange={handleSelectChange('competition')}
            label={t('competition.singular')}
          >
            <MenuItem value="">{t('competition.select')}</MenuItem>
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
          <InputLabel>{t('competition.series')}</InputLabel>
          <Select
            value={getValidSerieId()}
            onChange={(e) =>
              setGame((prev) => ({
                ...prev,
                competitionSerieId: Number(e.target.value),
              }))
            }
            label={t('competition.series')}
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

      {/* Row 3: Team (Home), Opponent */}
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormControl fullWidth>
          <InputLabel>{t('team.singular')}</InputLabel>
          <Select
            value={getValidTeamId()}
            onChange={(e) =>
              setGame((prev) => ({
                ...prev,
                teamId: Number(e.target.value),
                team: teams.find((team) => team.id === Number(e.target.value)),
                gameAthletes: [],
              }))
            }
            label={t('team.singular')}
            disabled={!selectedCompetition}
          >
            <MenuItem value="">{t('team.select')}</MenuItem>
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
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormControl fullWidth error={!!validationErrors['opponentId']}>
          <InputLabel>{t('opponent.singular')}</InputLabel>
          <Select
            value={getValidOpponentId()}
            onChange={(e) =>
              setGame((prev) => ({
                ...prev,
                opponentId: Number(e.target.value),
                opponent: opponents.find((opponent) => opponent.id === Number(e.target.value)),
              }))
            }
            label={t('opponent.singular')}
            renderValue={(selected) => {
              const opponent = opponents.find((o) => o.id === Number(selected));
              return opponent ? opponent.name : '';
            }}
          >
            {opponents.map((opponent) => (
              <MenuItem key={opponent.id} value={opponent.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {opponent.image && (
                    <img
                      src={opponent.image}
                      alt={opponent.name}
                      width={24}
                      height={24}
                      style={{ borderRadius: '50%' }}
                    />
                  )}
                  <Typography>{opponent.name}</Typography>
                </Box>
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

      {/* Row 4: Away, Venue */}
      <Grid size={{ xs: 12, sm: 3 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={game.away}
              onChange={(e) => handleCheckboxChange('away', e.target.checked)}
            />
          }
          label={t('game.away')}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 9 }}>
        <FormControl fullWidth>
          <InputLabel>{t('venue.singular')}</InputLabel>
          <Select
            value={getValidVenueId()}
            onChange={(e) =>
              setGame((prev) => ({
                ...prev,
                venueId: Number(e.target.value),
              }))
            }
            label={t('venue.singular')}
          >
            {venues.map((venue) => (
              <MenuItem key={venue.id} value={Number(venue.id)}>
                {venue.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Athletes Selection Section */}
      <Paper elevation={2} sx={{ p: 2, mt: 3 }}>
        {/* Header with count and actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6">{t('athlete.title')}</Typography>
            <Chip
              label={`${gameAthletes.filter((a) => a.selected).length}/12`}
              color={gameAthletes.filter((a) => a.selected).length >= 12 ? 'error' : 'primary'}
              size="small"
            />
            {gameAthletes.filter((a) => a.selected).length >= 12 && (
              <Typography variant="body2" color="success.main" sx={{ fontWeight: 500 }}>
                {t('game.convocationFull')}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title={t('filters.selectAll')}>
              <span>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<SelectAllIcon />}
                  disabled={gameAthletes.filter((a) => a.selected).length >= 12}
                  onClick={() => {
                    const selectedCount = gameAthletes.filter((a) => a.selected).length;
                    const remaining = 12 - selectedCount;
                    let added = 0;
                    setGameAthletes((prev) =>
                      prev.map((a) => {
                        if (!a.selected && added < remaining) {
                          added++;
                          return { ...a, selected: true };
                        }
                        return a;
                      })
                    );
                  }}
                >
                  {t('filters.selectAll')}
                </Button>
              </span>
            </Tooltip>
            <Tooltip title={t('filters.deselectAll')}>
              <Button
                size="small"
                variant="outlined"
                color="secondary"
                startIcon={<DeselectIcon />}
                onClick={() => {
                  setGameAthletes((prev) =>
                    prev.map((a) => ({
                      ...a,
                      selected: false,
                      number: '0',
                      period1: false,
                      period2: false,
                      period3: false,
                      period4: false,
                    }))
                  );
                  setGame((prev) => ({ ...prev, gameEquipments: [] }));
                }}
              >
                {t('filters.deselectAll')}
              </Button>
            </Tooltip>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Selected Athletes - sorted by birthdate (oldest first) then alphabetically */}
        {gameAthletes.filter((a) => a.selected).length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}
            >
              <Typography variant="subtitle2" color="text.secondary">
                {t('athlete.selected')} ({gameAthletes.filter((a) => a.selected).length})
              </Typography>
              {distinctEquipmentColors.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    {t('equipment.title')}:
                  </Typography>
                  {distinctEquipmentColors.map(({ color, colorHex, colorId }) => {
                    const hasIssues = equipmentIssues.some((issue) => issue.colorId === colorId);
                    return (
                      <Box
                        key={colorId}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          px: 1,
                          py: 0.25,
                          borderRadius: 1,
                          backgroundColor: hasIssues ? 'warning.light' : 'action.hover',
                        }}
                      >
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            backgroundColor: colorHex,
                            borderRadius: '2px',
                            border: '1px solid #ccc',
                          }}
                        />
                        <Typography variant="caption" sx={{ fontWeight: 500 }}>
                          {color}
                        </Typography>
                        {hasIssues && <WarningIcon color="warning" sx={{ fontSize: 14 }} />}
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {gameAthletes
                .filter((a) => a.selected)
                .sort((a, b) => {
                  const dateA = a.athlete?.birthdate ? new Date(a.athlete.birthdate).getTime() : 0;
                  const dateB = b.athlete?.birthdate ? new Date(b.athlete.birthdate).getTime() : 0;
                  if (dateA !== dateB) return dateA - dateB;
                  return (a.athlete?.name || '').localeCompare(b.athlete?.name || '');
                })
                .map((athlete) => {
                  return (
                    <Paper
                      key={athlete.athleteId}
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        backgroundColor: 'action.selected',
                        '&:hover': { backgroundColor: 'action.hover' },
                      }}
                    >
                      {/* Remove button */}
                      <Tooltip title={t('actions.remove')}>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() =>
                            handleAthleteFieldChange(athlete.athleteId, 'selected', false)
                          }
                        >
                          <CheckCircleIcon />
                        </IconButton>
                      </Tooltip>

                      {/* Avatar with number */}
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: 'primary.main',
                          fontSize: '0.9rem',
                        }}
                      >
                        {athlete.number || '?'}
                      </Avatar>

                      {/* Name and size */}
                      <Box sx={{ minWidth: 150 }}>
                        <Typography sx={{ fontWeight: 500 }}>{athlete.athlete?.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {athlete.athlete?.shirtSize || '?'}
                        </Typography>
                      </Box>

                      {/* Number input */}
                      <TextField
                        size="small"
                        label="#"
                        value={athlete.number}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^$|^0$|^00$|^[1-9]$|^[1-9][0-9]$/.test(value)) {
                            handleAthleteFieldChange(athlete.athleteId, 'number', value);
                          }
                        }}
                        slotProps={{ htmlInput: { maxLength: 2 } }}
                        sx={{ width: 60 }}
                      />

                      {/* Period chips */}
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {[1, 2, 3, 4].map((p) => (
                          <Chip
                            key={p}
                            label={`P${p}`}
                            size="small"
                            color={
                              athlete[`period${p}` as keyof GameAthleteInterface]
                                ? 'primary'
                                : 'default'
                            }
                            variant={
                              athlete[`period${p}` as keyof GameAthleteInterface]
                                ? 'filled'
                                : 'outlined'
                            }
                            onClick={() =>
                              handleAthleteFieldChange(
                                athlete.athleteId,
                                `period${p}` as keyof GameAthleteInterface,
                                !athlete[`period${p}` as keyof GameAthleteInterface]
                              )
                            }
                            sx={{ cursor: 'pointer' }}
                          />
                        ))}
                      </Box>

                      {/* Equipment per color - dropdowns */}
                      <Box
                        sx={{
                          ml: 'auto',
                          display: 'flex',
                          gap: 1,
                          flexWrap: 'wrap',
                          alignItems: 'center',
                        }}
                      >
                        {distinctEquipmentColors.map(({ color, colorHex, colorId }) => {
                          const assignment = gameEquipments.find(
                            (ge) =>
                              ge.athleteId === athlete.athleteId && ge.equipmentColorId === colorId
                          );
                          const hasIssue = equipmentIssues.some(
                            (i) => i.athleteId === athlete.athleteId && i.colorId === colorId
                          );
                          const isManual =
                            assignment?.manualOverride ||
                            manualOverrides.has(`${athlete.athleteId}-${colorId}`);
                          const colorNameLower = color.toLowerCase().trim();
                          const hasPreferredNumber = athlete.athlete?.preferredNumbers?.some(
                            (p) => p.color?.toLowerCase().trim() === colorNameLower
                          );
                          const availableEquipmentsForColor = equipments.filter(
                            (eq) => eq.equipmentColorId === colorId
                          );
                          // Check if current assignment exists in available options to avoid MUI warnings
                          const validEquipmentId =
                            assignment?.equipmentId &&
                            availableEquipmentsForColor.some(
                              (eq) => eq.id === assignment.equipmentId
                            )
                              ? assignment.equipmentId
                              : '';

                          return (
                            <Box
                              key={colorId}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                backgroundColor: hasIssue ? 'warning.light' : undefined,
                                borderRadius: 1,
                                p: hasIssue ? 0.5 : 0,
                                position: 'relative',
                              }}
                            >
                              <Box
                                sx={{
                                  width: 14,
                                  height: 14,
                                  backgroundColor: colorHex,
                                  borderRadius: '3px',
                                  border: '1px solid #ccc',
                                  flexShrink: 0,
                                }}
                              />
                              <FormControl size="small" sx={{ minWidth: 85 }}>
                                <Select
                                  value={validEquipmentId}
                                  displayEmpty
                                  onChange={(e) => {
                                    const newId = e.target.value as number | '';
                                    handleManualEquipmentChange(
                                      athlete.athleteId!,
                                      colorId,
                                      newId === '' ? null : newId
                                    );
                                  }}
                                  sx={{
                                    '& .MuiSelect-select': {
                                      py: 0.25,
                                      px: 1,
                                      fontSize: '0.8rem',
                                    },
                                    '& .MuiOutlinedInput-notchedOutline': {
                                      ...(hasPreferredNumber &&
                                        !isManual && {
                                          borderColor: 'error.main',
                                          borderWidth: 2,
                                        }),
                                      ...(isManual && {
                                        borderColor: 'info.main',
                                        borderWidth: 2,
                                      }),
                                    },
                                  }}
                                >
                                  <MenuItem value="">
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      sx={{ fontSize: '0.8rem' }}
                                    >
                                      {hasIssue ? t('equipment.assignment.noFit') : '-'}
                                    </Typography>
                                  </MenuItem>
                                  {availableEquipmentsForColor
                                    .sort((a, b) => a.number - b.number)
                                    .map((eq) => {
                                      const isUsedByOther = gameEquipments.some(
                                        (ge) =>
                                          ge.equipmentId === eq.id &&
                                          ge.athleteId !== athlete.athleteId &&
                                          ge.equipmentColorId === colorId
                                      );
                                      return (
                                        <MenuItem
                                          key={eq.id}
                                          value={eq.id}
                                          disabled={isUsedByOther}
                                          sx={{ opacity: isUsedByOther ? 0.5 : 1 }}
                                        >
                                          <Box
                                            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                                          >
                                            <Typography
                                              variant="body2"
                                              sx={{ fontWeight: 600, fontSize: '0.8rem' }}
                                            >
                                              #{eq.number}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                              ({eq.size})
                                            </Typography>
                                          </Box>
                                        </MenuItem>
                                      );
                                    })}
                                </Select>
                              </FormControl>
                              {hasIssue && (
                                <Tooltip title={t('equipment.assignment.hasIssues')}>
                                  <WarningIcon color="warning" sx={{ fontSize: 16 }} />
                                </Tooltip>
                              )}
                            </Box>
                          );
                        })}
                      </Box>
                    </Paper>
                  );
                })}
            </Box>
          </Box>
        )}

        {/* Available Athletes - sorted by birthdate (oldest first) then alphabetically */}
        {gameAthletes.filter((a) => !a.selected).length > 0 && (
          <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              {t('athlete.available')} ({gameAthletes.filter((a) => !a.selected).length})
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {gameAthletes
                .filter((a) => !a.selected)
                .sort((a, b) => {
                  const dateA = a.athlete?.birthdate ? new Date(a.athlete.birthdate).getTime() : 0;
                  const dateB = b.athlete?.birthdate ? new Date(b.athlete.birthdate).getTime() : 0;
                  if (dateA !== dateB) return dateA - dateB;
                  return (a.athlete?.name || '').localeCompare(b.athlete?.name || '');
                })
                .map((athlete) => (
                  <Chip
                    key={athlete.athleteId}
                    icon={<UncheckedIcon />}
                    label={athlete.athlete?.name}
                    variant="outlined"
                    disabled={gameAthletes.filter((a) => a.selected).length >= 12}
                    onClick={() => {
                      if (gameAthletes.filter((a) => a.selected).length < 12) {
                        handleAthleteFieldChange(athlete.athleteId, 'selected', true);
                      }
                    }}
                    sx={{
                      cursor:
                        gameAthletes.filter((a) => a.selected).length >= 12
                          ? 'not-allowed'
                          : 'pointer',
                      '&:hover': {
                        backgroundColor:
                          gameAthletes.filter((a) => a.selected).length >= 12
                            ? undefined
                            : 'action.hover',
                      },
                    }}
                  />
                ))}
            </Box>
          </Box>
        )}
      </Paper>

      {/* Equipment legend */}
      {gameAthletes.filter((a) => a.selected).length > 0 && distinctEquipmentColors.length > 0 && (
        <Box sx={{ mt: 1, px: 2, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box
              sx={{
                width: 20,
                height: 14,
                border: '2px solid',
                borderColor: 'error.main',
                borderRadius: 0.5,
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {t('equipment.legend.fixed')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box
              sx={{
                width: 20,
                height: 14,
                border: '2px solid',
                borderColor: 'info.main',
                borderRadius: 0.5,
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {t('equipment.legend.manual')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box
              sx={{
                width: 20,
                height: 14,
                border: '1px solid',
                borderColor: 'grey.400',
                borderRadius: 0.5,
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {t('equipment.legend.auto')}
            </Typography>
          </Box>
          {equipmentIssues.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <WarningIcon color="warning" sx={{ fontSize: 16 }} />
              <Typography variant="caption" color="warning.main">
                {t('equipment.assignment.issuesWarning', { count: equipmentIssues.length })}
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Notes & Speech Section */}
      <Grid size={{ xs: 12 }}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" sx={{ mb: 2 }}>
          {t('common.notes')}
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TextField
          fullWidth
          label={t('common.notes')}
          value={game.notes ?? ''}
          onChange={handleChange('notes')}
          error={!!validationErrors['notes']}
          helperText={validationErrors['notes']}
          multiline
          rows={3}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label={t('equipment.speech')}
          value={game.speech ?? ''}
          onChange={(e) =>
            setGame((prev) => ({
              ...prev,
              speech: e.target.value,
            }))
          }
          helperText={t('equipment.speechHelper')}
        />
      </Grid>

      {/* Images Section */}
      <Grid size={{ xs: 12 }}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" sx={{ mb: 2 }}>
          {t('common.images')}
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 2,
          }}
        >
          {[1, 2, 3, 4].map((idx) => {
            const imageKey = `image${idx}` as keyof GameInterface;
            const hasImage = !!game[imageKey];
            return (
              <Paper
                key={idx}
                variant="outlined"
                sx={{
                  aspectRatio: '4/3',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  backgroundColor: hasImage ? 'transparent' : 'action.hover',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: 'primary.main',
                  },
                }}
              >
                {hasImage ? (
                  <>
                    <img
                      src={(game[imageKey] as string) || ''}
                      alt={`image ${idx}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    <IconButton
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        '&:hover': { backgroundColor: 'error.light', color: 'white' },
                      }}
                      onClick={() => setGame((prev) => ({ ...prev, [imageKey]: null }))}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </>
                ) : (
                  <Button component="label" sx={{ width: '100%', height: '100%' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        color: 'text.secondary',
                      }}
                    >
                      <AddIcon sx={{ fontSize: 32, mb: 0.5 }} />
                      <Typography variant="caption">{t('images.upload')}</Typography>
                    </Box>
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
                )}
              </Paper>
            );
          })}
        </Box>
      </Grid>
      <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button variant="contained" onClick={handleUpdateInfos}>
          {t('fpb.getInfos')}
        </Button>
        <Button variant="contained" onClick={handleSaveGame}>
          {t(saveText ? saveText : 'Add')}
        </Button>
        <Button variant="outlined" onClick={handleCancelGame} sx={{ marginLeft: 2 }}>
          {t('actions.cancel')}
        </Button>
      </Grid>
    </Grid>
  );
};

GameComponent.displayName = 'GameComponent';
export default GameComponent;
