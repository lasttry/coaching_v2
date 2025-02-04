import { AthleteInterface } from '../games/types';
import { EchelonInterface } from '../echelons/types';

export interface TeamInterface {
  id: number;
  name: string;
  type: 'A' | 'B' | 'OTHER'; // Subtypes of the team
  clubId: number;
  echelonId: number;
  createdAt: string; // ISO string for date
  updatedAt: string; // ISO string for date
  athletes: Array<{
    athlete: AthleteInterface; // Related athlete object
    athleteId: number;
  }>;
  echelon: EchelonInterface; // Related echelon object
}
