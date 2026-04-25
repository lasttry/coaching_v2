'use client';

import React, { ReactElement, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Alert,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import RemoveIcon from '@mui/icons-material/Remove';
import '@/lib/i18n.client';
import { useTranslation } from 'react-i18next';
import type {
  PracticeGroupSetInterface,
  PracticeGroupTeamInterface,
  PracticeGroupsInterface,
} from '@/types/practices/types';

interface GroupAthlete {
  id: number;
  name: string;
}

interface Props {
  athletes: GroupAthlete[];
  /** Persisted groups data (server source of truth). When `null` or
   * `undefined` the builder starts empty. */
  value: PracticeGroupsInterface | null;
  onChange: (groups: PracticeGroupsInterface | null) => void;
  /** When the parent has not saved the practice yet we keep the builder
   * fully usable but show a hint that the data only persists on save. */
  hint?: string;
}

/* ------------------- helpers ------------------- */

let setSeq = 0;
let teamSeq = 0;

function nextSetId(): string {
  setSeq += 1;
  return `set-${Date.now().toString(36)}-${setSeq}`;
}

function nextTeamId(): string {
  teamSeq += 1;
  return `team-${Date.now().toString(36)}-${teamSeq}`;
}

function makeTeam(index: number, size: number): PracticeGroupTeamInterface {
  return {
    id: nextTeamId(),
    name: `Team ${index + 1}`,
    players: Array.from({ length: Math.max(0, size) }, () => null),
  };
}

function makeSet(index: number): PracticeGroupSetInterface {
  return {
    id: nextSetId(),
    name: `Set ${index + 1}`,
    teams: [makeTeam(0, 0), makeTeam(1, 0)],
  };
}

/* ------------------- component ------------------- */

function PracticeGroupsBuilderInner({ athletes, value, onChange, hint }: Props): ReactElement {
  const { t } = useTranslation();

  const sets = useMemo<PracticeGroupSetInterface[]>(() => value?.sets ?? [], [value]);

  /* Active set is purely UI state; we keep a ref so toggling between
   * existing sets does not force a parent re-render via onChange. */
  const activeSetIdRef = useRef<string | null>(null);
  const [, forceRender] = React.useReducer((n: number) => n + 1, 0);

  useEffect(() => {
    // Make sure the activeSetId is always one that still exists.
    if (sets.length === 0) {
      if (activeSetIdRef.current !== null) {
        activeSetIdRef.current = null;
        forceRender();
      }
      return;
    }
    if (!sets.some((s) => s.id === activeSetIdRef.current)) {
      activeSetIdRef.current = sets[0].id;
      forceRender();
    }
  }, [sets]);

  const activeSetId = activeSetIdRef.current;
  const activeSet = useMemo(
    () => sets.find((s) => s.id === activeSetId) ?? null,
    [sets, activeSetId]
  );

  const assignedInActiveSet = useMemo(() => {
    const out = new Set<number>();
    if (!activeSet) return out;
    for (const team of activeSet.teams) {
      for (const id of team.players) {
        if (id != null) out.add(id);
      }
    }
    return out;
  }, [activeSet]);

  /* Pre-compute the option list per slot once, keyed by team id and the
   * already-selected athlete. We render a lot of <Select> children, so
   * filtering inside each render is the heaviest hot path. */
  const optionsForSlot = useCallback(
    (currentId: number | null): GroupAthlete[] => {
      if (currentId == null) {
        return athletes.filter((a) => !assignedInActiveSet.has(a.id));
      }
      return athletes.filter((a) => a.id === currentId || !assignedInActiveSet.has(a.id));
    },
    [athletes, assignedInActiveSet]
  );

  /* ------------------- mutations ------------------- */

  const replaceSets = useCallback(
    (next: PracticeGroupSetInterface[]) => {
      onChange(next.length === 0 ? null : { sets: next });
    },
    [onChange]
  );

  const updateActiveSet = useCallback(
    (updater: (set: PracticeGroupSetInterface) => PracticeGroupSetInterface) => {
      if (!activeSetId) return;
      replaceSets(sets.map((s) => (s.id === activeSetId ? updater(s) : s)));
    },
    [sets, activeSetId, replaceSets]
  );

  const handleAddSet = useCallback(() => {
    const newSet = makeSet(sets.length);
    activeSetIdRef.current = newSet.id;
    replaceSets([...sets, newSet]);
  }, [sets, replaceSets]);

  const handleRemoveSet = useCallback(
    (setId: string) => {
      const next = sets.filter((s) => s.id !== setId);
      if (activeSetIdRef.current === setId) {
        activeSetIdRef.current = next[0]?.id ?? null;
      }
      replaceSets(next);
    },
    [sets, replaceSets]
  );

  const handleAddTeam = useCallback(() => {
    updateActiveSet((set) => ({
      ...set,
      teams: [...set.teams, makeTeam(set.teams.length, 0)],
    }));
  }, [updateActiveSet]);

  const handleRemoveLastTeam = useCallback(() => {
    updateActiveSet((set) => {
      if (set.teams.length <= 1) return set;
      return { ...set, teams: set.teams.slice(0, -1) };
    });
  }, [updateActiveSet]);

  const handleSetTeamSize = useCallback(
    (teamId: string, rawSize: number) => {
      const size = Math.max(0, Math.round(Number.isFinite(rawSize) ? rawSize : 0));
      updateActiveSet((set) => ({
        ...set,
        teams: set.teams.map((team) => {
          if (team.id !== teamId) return team;
          const players: Array<number | null> = Array.from(
            { length: size },
            (_, i) => team.players[i] ?? null
          );
          return { ...team, players };
        }),
      }));
    },
    [updateActiveSet]
  );

  const handleSetPlayer = useCallback(
    (teamId: string, slotIdx: number, athleteId: number | null) => {
      updateActiveSet((set) => ({
        ...set,
        teams: set.teams.map((team) => {
          if (team.id !== teamId) return team;
          const next = [...team.players];
          next[slotIdx] = athleteId;
          return { ...team, players: next };
        }),
      }));
    },
    [updateActiveSet]
  );

  const handleBalance = useCallback(() => {
    updateActiveSet((set) => {
      const teamCount = Math.max(1, set.teams.length);
      const total = athletes.length;
      const base = Math.floor(total / teamCount);
      const remainder = total % teamCount;
      return {
        ...set,
        teams: set.teams.map((team, idx) => {
          const target = base + (idx < remainder ? 1 : 0);
          const players: Array<number | null> = Array.from(
            { length: target },
            (_, i) => team.players[i] ?? null
          );
          return { ...team, players };
        }),
      };
    });
  }, [athletes.length, updateActiveSet]);

  /* ------------------- render ------------------- */

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 1,
          gap: 1,
          flexWrap: 'wrap',
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {t('practice.groups.title')}
        </Typography>
        <Button size="small" startIcon={<AddIcon />} onClick={handleAddSet}>
          {t('practice.groups.addSet')}
        </Button>
      </Stack>

      {sets.length === 0 ? (
        <Alert severity="info" variant="outlined">
          {t('practice.groups.noSets')}
        </Alert>
      ) : (
        <>
          <Stack direction="row" sx={{ gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
            {sets.map((set, idx) => (
              <Chip
                key={set.id}
                label={t('practice.groups.setName', { number: idx + 1 })}
                color={set.id === activeSetId ? 'primary' : 'default'}
                variant={set.id === activeSetId ? 'filled' : 'outlined'}
                onClick={() => {
                  if (activeSetIdRef.current !== set.id) {
                    activeSetIdRef.current = set.id;
                    forceRender();
                  }
                }}
                onDelete={() => handleRemoveSet(set.id)}
                deleteIcon={<DeleteIcon />}
              />
            ))}
          </Stack>

          {activeSet ? (
            <Paper
              variant="outlined"
              sx={{ p: 1.5, borderRadius: 1.5, backgroundColor: 'background.default' }}
            >
              <Stack
                direction="row"
                sx={{ alignItems: 'center', gap: 1, mb: 1.5, flexWrap: 'wrap' }}
              >
                <Typography variant="body2" sx={{ fontWeight: 700, mr: 1 }}>
                  {activeSet.name}
                </Typography>
                <Button size="small" startIcon={<AddIcon />} onClick={handleAddTeam}>
                  {t('practice.groups.addGroup')}
                </Button>
                <Button
                  size="small"
                  startIcon={<RemoveIcon />}
                  onClick={handleRemoveLastTeam}
                  disabled={activeSet.teams.length <= 1}
                >
                  {t('actions.remove')}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleBalance}
                  disabled={athletes.length === 0}
                >
                  {t('practice.groups.autoBalance')}
                </Button>
                <Chip
                  size="small"
                  variant="outlined"
                  label={t('practice.groups.assignedCount', {
                    count: assignedInActiveSet.size,
                    total: athletes.length,
                  })}
                />
              </Stack>

              <Stack direction={{ xs: 'column', md: 'row' }} sx={{ gap: 1.5, flexWrap: 'wrap' }}>
                {activeSet.teams.map((team, teamIdx) => (
                  <TeamCard
                    key={team.id}
                    team={team}
                    teamIdx={teamIdx}
                    athletes={athletes}
                    optionsForSlot={optionsForSlot}
                    onChangeSize={handleSetTeamSize}
                    onChangePlayer={handleSetPlayer}
                  />
                ))}
              </Stack>
            </Paper>
          ) : null}
        </>
      )}

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
        {hint ?? t('practice.groups.hint')}
      </Typography>
    </Paper>
  );
}

/* ------------------- TeamCard ------------------- */

interface TeamCardProps {
  team: PracticeGroupTeamInterface;
  teamIdx: number;
  athletes: GroupAthlete[];
  optionsForSlot: (currentId: number | null) => GroupAthlete[];
  onChangeSize: (teamId: string, size: number) => void;
  onChangePlayer: (teamId: string, slotIdx: number, athleteId: number | null) => void;
}

const TeamCard = React.memo(function TeamCard({
  team,
  teamIdx,
  optionsForSlot,
  onChangeSize,
  onChangePlayer,
}: TeamCardProps): ReactElement {
  const { t } = useTranslation();

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.25,
        borderRadius: 1.25,
        minWidth: 260,
        flex: 1,
        backgroundColor: 'background.paper',
      }}
    >
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1, gap: 1 }}
      >
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {t('practice.groups.groupName', { number: teamIdx + 1 })}
        </Typography>
        <TextField
          size="small"
          type="number"
          label={t('practice.groups.groupSize')}
          value={team.players.length}
          onChange={(e) => onChangeSize(team.id, Number(e.target.value) || 0)}
          sx={{ width: 120 }}
          slotProps={{ htmlInput: { min: 0, max: 30 } }}
        />
      </Stack>

      <Stack sx={{ gap: 1 }}>
        {team.players.map((playerId, slotIdx) => (
          <PlayerSlot
            key={`${team.id}-slot-${slotIdx}`}
            slotIdx={slotIdx}
            teamId={team.id}
            playerId={playerId}
            options={optionsForSlot(playerId)}
            onChange={onChangePlayer}
          />
        ))}
      </Stack>
    </Paper>
  );
});

/* ------------------- PlayerSlot ------------------- */

interface PlayerSlotProps {
  teamId: string;
  slotIdx: number;
  playerId: number | null;
  options: GroupAthlete[];
  onChange: (teamId: string, slotIdx: number, athleteId: number | null) => void;
}

const PlayerSlot = React.memo(function PlayerSlot({
  teamId,
  slotIdx,
  playerId,
  options,
  onChange,
}: PlayerSlotProps): ReactElement {
  const { t } = useTranslation();
  const label = t('practice.groups.playerSlot', { number: slotIdx + 1 });

  return (
    <FormControl size="small" fullWidth>
      <InputLabel>{label}</InputLabel>
      <Select<number | ''>
        label={label}
        value={playerId ?? ''}
        onChange={(e) => {
          const v = e.target.value;
          onChange(teamId, slotIdx, v === '' ? null : Number(v));
        }}
        MenuProps={{ slotProps: { paper: { sx: { maxHeight: 360 } } } }}
      >
        <MenuItem value="">
          <em>{t('practice.groups.selectPlayer')}</em>
        </MenuItem>
        {options.map((athlete) => (
          <MenuItem key={athlete.id} value={athlete.id}>
            {athlete.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
});

const PracticeGroupsBuilder = React.memo(PracticeGroupsBuilderInner);
PracticeGroupsBuilder.displayName = 'PracticeGroupsBuilder';

export default PracticeGroupsBuilder;
