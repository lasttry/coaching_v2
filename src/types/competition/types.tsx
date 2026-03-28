import { EchelonInterface } from '../echelons/types';

export interface CompetitionInterface {
  id: number | null;
  name: string;
  description: string | null;
  image: string | null;
  echelonId: number | null;
  echelon: EchelonInterface | null;

  fpbCompetitionId?: number;

  competitionSeries?: CompetitionSerieInterface[] | null;

  createAt?: Date;
  updatedAt?: Date;
}

export interface CompetitionSerieInterface {
  id: number | null;
  name: string;

  fpbSerieId?: number;

  competitionId?: number | null;
  competition?: CompetitionInterface | null;

  createdAt?: Date;
  updatedAt?: Date;
}
