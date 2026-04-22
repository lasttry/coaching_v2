import { Size } from '@prisma/client';
import { EchelonInterface } from '../echelons/types';

export interface EquipmentColorInterface {
  id: number;
  clubId: number;
  seasonId: number;
  echelonId: number;
  echelon?: EchelonInterface;

  color: string;
  colorHex: string;
  numberColorHex: string;

  equipments?: EquipmentItemInterface[];

  createdAt?: string;
  updatedAt?: string;
}

export interface EquipmentItemInterface {
  id: number;
  equipmentColorId: number;
  number: number;
  size: Size;
  createdAt?: string;
  updatedAt?: string;
}
