import { AthleteInterface } from '../athlete/type';

export interface AthletePreferredNumberInterface {
  id: number;
  athleteId: number;
  number: number;
  preference: number;
  athlete?: AthleteInterface; // opcional porque vem apenas quando incluído no Prisma
}
