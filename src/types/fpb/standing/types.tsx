export interface FpbStandingInterface {
  position: number;
  name: string;
  shortName: string;
  fpbTeamId: number;
  games: number;
  wins: number;
  losses: number;
  fc?: number;
  pm?: number;
  ps?: number;
  dif?: number;
  points: number;
}
