import { Gender } from '@prisma/client';

export interface EchelonInterface {
  id: number | null;
  minAge: number | null;
  maxAge: number | null;
  name: string;
  description: string;
  gender: Gender | null;
}
