import { Size } from '@prisma/client';

export interface EquipmentColorBasicInterface {
  id: number;
  clubId: number;
  seasonId: number;
  echelonId: number;
  color: string;
  colorHex: string;
  numberColorHex: string;
}

export interface EquipmentInterface {
  id: number;
  equipmentColorId: number;
  equipmentColor?: EquipmentColorBasicInterface;

  number: number;
  size: Size;

  // Flattened fields from equipmentColor (for backward compatibility)
  color?: string;
  colorHex?: string;
  numberColorHex?: string;
  echelonId?: number;
  clubId?: number;
  seasonId?: number;

  createdAt?: string;
  updatedAt?: string;
}
