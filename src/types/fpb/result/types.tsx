export interface FpbResultInterface {
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  detailUrl?: string;
}
