import { EchelonInterface } from '../echelons/types';
import { SizeEnum } from '../game/types';

export interface EquipmentInterface {
  id: number;
  clubId: number;
  seasonId: number;
  echelonId: number;
  echelon?: EchelonInterface;

  color: string;
  number: number;
  size: SizeEnum;
  createdAt?: string;
  updatedAt?: string;
}

export interface GameEquipmentInterface {
  id: number;
  gameId: number;
  athleteId: number;
  equipmentId: number;
}
