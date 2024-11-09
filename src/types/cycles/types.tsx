// Define the types for MacroCycles
export interface Macrocycle {
  id?: number;
  number?: number;
  name: string;
  startDate: string;
  endDate: string;
  notes: string;
}

export interface Mesocycle {
  id: number;
  number: number;
  name: string;
  startDate: string;
  endDate: string;
  notes?: string;
  macrocycleId: number; // foreign key linking to Macrocycle
}

export interface MaxNumbers {
  maxNumber: number;
}