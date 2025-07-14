import { AthleteInterface } from '../games/types';
import { EchelonInterface } from '../echelons/types';

export interface TeamInterface {
  id: number | null;
  name: string;
  type: 'A' | 'B' | 'OTHER'; // Subtypes of the team
  clubId: number;
  echelonId: number;
  createdAt?: string | null; // ISO string for date
  updatedAt?: string | null; // ISO string for date
  athletes: Array<{
    athlete: AthleteInterface; // Related athlete object
    athleteId: number;
  }>;
  echelon?: EchelonInterface | null; // Related echelon object
}
