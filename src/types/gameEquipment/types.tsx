import type { EquipmentInterface, EquipmentColorBasicInterface } from '../equipment/types';

export interface EquipmentWithColorInterface extends EquipmentInterface {
  equipmentColor?: EquipmentColorBasicInterface;
}

export interface GameEquipmentInterface {
  id?: number;
  gameId: number;
  athleteId: number;
  equipmentId: number;
  equipmentColorId: number;
  manualOverride?: boolean;

  equipment?: EquipmentWithColorInterface;
  equipmentColor?: EquipmentColorBasicInterface;
}

export interface EquipmentAssignmentIssue {
  athleteId: number;
  athleteName: string;
  colorId: number;
  colorName: string;
  reason: 'no_size_available' | 'no_equipment_available';
}
