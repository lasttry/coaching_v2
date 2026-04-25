import type {
  PracticeGroupSetInterface,
  PracticeGroupTeamInterface,
  PracticeGroupsInterface,
} from '@/types/practices/types';

/** Coerce arbitrary input (typically the JSON column from Postgres or a
 * client request body) into a well-formed {@link PracticeGroupsInterface}.
 *
 * - Strips unknown fields and ignores anything that is not the right type.
 * - Drops player slots whose athlete id is not in the optional `validAthleteIds`
 *   set (so groups never reference athletes that no longer belong to the
 *   roster). Slots are kept as `null` placeholders to preserve the team
 *   capacity the coach configured.
 * - Caps team / set / player counts to defensive maximums to avoid abusive
 *   payloads. */
const MAX_SETS = 16;
const MAX_TEAMS_PER_SET = 12;
const MAX_PLAYERS_PER_TEAM = 30;

export function sanitisePracticeGroups(
  raw: unknown,
  validAthleteIds?: ReadonlySet<number>
): PracticeGroupsInterface | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as { sets?: unknown };
  const sets = Array.isArray(obj.sets) ? obj.sets : [];
  if (sets.length === 0) return null;

  const cleanedSets: PracticeGroupSetInterface[] = [];
  for (const setRaw of sets.slice(0, MAX_SETS)) {
    if (!setRaw || typeof setRaw !== 'object') continue;
    const setObj = setRaw as {
      id?: unknown;
      name?: unknown;
      teams?: unknown;
    };
    const teams = Array.isArray(setObj.teams) ? setObj.teams : [];
    const cleanedTeams: PracticeGroupTeamInterface[] = [];
    for (const teamRaw of teams.slice(0, MAX_TEAMS_PER_SET)) {
      if (!teamRaw || typeof teamRaw !== 'object') continue;
      const teamObj = teamRaw as {
        id?: unknown;
        name?: unknown;
        players?: unknown;
      };
      const players = Array.isArray(teamObj.players) ? teamObj.players : [];
      const cleanedPlayers: Array<number | null> = players
        .slice(0, MAX_PLAYERS_PER_TEAM)
        .map((value) => {
          if (value == null) return null;
          const n = Number(value);
          if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) return null;
          if (validAthleteIds && !validAthleteIds.has(n)) return null;
          return n;
        });
      cleanedTeams.push({
        id:
          typeof teamObj.id === 'string' && teamObj.id
            ? teamObj.id
            : `team-${cleanedTeams.length + 1}`,
        name:
          typeof teamObj.name === 'string' && teamObj.name.trim()
            ? teamObj.name.trim().slice(0, 80)
            : `Team ${cleanedTeams.length + 1}`,
        players: cleanedPlayers,
      });
    }
    if (cleanedTeams.length === 0) continue;
    cleanedSets.push({
      id: typeof setObj.id === 'string' && setObj.id ? setObj.id : `set-${cleanedSets.length + 1}`,
      name:
        typeof setObj.name === 'string' && setObj.name.trim()
          ? setObj.name.trim().slice(0, 80)
          : `Set ${cleanedSets.length + 1}`,
      teams: cleanedTeams,
    });
  }
  if (cleanedSets.length === 0) return null;
  return { sets: cleanedSets };
}
