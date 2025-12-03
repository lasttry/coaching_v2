import { Size } from "../game/types";

export interface EquipmentInterface {
  id: number;
  clubId: number;
  color: string;
  number: number;
  size: Size;
  createdAt: string;
  updatedAt: string;
}

export interface EquipmentPayload {
  clubId: number;
  color: string;
  number: number;
  size: Size;
}