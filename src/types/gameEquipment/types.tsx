import type { EquipmentInterface, EquipmentColorBasicInterface } from '../equipment/types';

export interface EquipmentWithColorInterface extends EquipmentInterface {
  equipmentColor?: EquipmentColorBasicInterface;
}

export interface GameEquipmentInterface {
  id?: number;
  gameId: number;
  athleteId: number;
  equipmentId: number;

  equipment?: EquipmentWithColorInterface;
}
