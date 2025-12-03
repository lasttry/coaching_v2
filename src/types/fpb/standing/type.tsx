export interface FpbStandingInterface {
  position: number;
  name: string;
  shortName: string;
  fpbTeamId: number;
  games: number; // J
  wins: number; // V
  losses: number; // D
  fc?: number; // FC
  pm?: number; // PM
  ps?: number; // PS
  dif?: number; // DIF
  points: number; // PTS
}
