import { Athlete } from '@/types/Athlete';
import { Team } from '@/types/Team';

export interface Game {
  id: number;
  createdAt: string;
  updatedAt: string;
  number?: number;
  date: string;
  away: boolean;
  competition?: string;
  subcomp?: string;
  oponentId: number;
  notes?: string;
  gameAthletes: GameAthletes[];
  teams: Team;
}

export interface GameAthletes {
  gameId: number;
  athleteId: number;
  athletes: Athlete
}
