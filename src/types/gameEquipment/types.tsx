import type { EquipmentInterface } from '../equipment/types';

export interface GameEquipmentInterface {
  id?: number;
  gameId: number;
  athleteId: number;
  equipmentId: number;

  equipment?: EquipmentInterface;
}
