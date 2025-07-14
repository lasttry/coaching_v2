import { EchelonInterface } from '../echelons/types';
import { GameInterface } from '../games/types';

export interface CompetitionInterface {
  id: number | null;
  name: string;
  description: string | null;
  image: string | null;
  echelonId: number | null;
  echelon: EchelonInterface | null;

  competitionSeries?: CompetitionSerieInterface[] | null;
  games?: GameInterface[] | null;

  createAt?: Date;
  updatedAt?: Date;
}

export interface CompetitionSerieInterface {
  id: number | null;
  name: string;
  competitionId?: number | null;
  competition?: CompetitionInterface | null;
  games?: GameInterface | null;

  createdAt?: Date;
  updatedAt?: Date;
}
