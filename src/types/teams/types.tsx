import { AthleteInterface } from '../athlete/types';
import { EchelonInterface } from '../echelons/types';

export interface TeamInterface {
  id: number | null;
  name: string;
  type: 'A' | 'B' | 'C' | 'OTHER';
  clubId: number;
  echelonId: number;
  fpbTeamId?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  athletes: Array<{
    athlete: AthleteInterface;
    athleteId: number;
  }>;
  echelon?: EchelonInterface | null;
}
