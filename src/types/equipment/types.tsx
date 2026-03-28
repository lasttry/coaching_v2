import { Size } from '@prisma/client';
import { EchelonInterface } from '../echelons/types';

export interface EquipmentInterface {
  id: number;
  clubId: number;
  seasonId: number;
  echelonId: number;
  echelon?: EchelonInterface;

  color: string;
  number: number;
  size: Size;
  createdAt?: string;
  updatedAt?: string;
}
