import { EchelonInterface } from '../echelons/types';

export interface CompetitionInterface {
  id: number | null;
  name: string;
  description: string | null;
  image: string | null;
  echelonId: number | null;
  echelon: EchelonInterface | null;
}
