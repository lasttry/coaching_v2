// src/types/statistics.ts
export interface AthleteGameStatistics {
  id: number;
  athlete_id: number;
  game_id: number;
  freethrow_scored: number;
  freethrow_missed: number;
  fieldgoal_scored: number;
  fieldgoal_missed: number;
  threepts_scored: number;
  threepts_missed: number;
  assists: number;
  defensive_rebounds: number;
  offensive_rebounds: number;
  total_rebounds: number;
  blocks: number;
  steals: number;
  turnovers: number;
  fouls: number;
  team_lost_defensive_rebounds: number;
}
