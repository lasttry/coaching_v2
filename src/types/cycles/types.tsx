export interface MacrocycleInterface {
  id: number;
  name?: string | null;
  number?: number | null;
  startDate: Date;
  endDate: Date;
  notes?: string | null;
  mesocycles: MesocycleInterface[];
}

export interface MesocycleInterface {
  id: number;
  number?: number | null;
  name?: string | null;
  startDate?: Date;
  endDate?: Date;
  notes?: string | null;
  macrocycleId?: number;
  macrocycle?: MacrocycleInterface;
  microcycles?: MicrocycleInterface[];
}

export interface MicrocycleInterface {
  id: number;
  number?: number | null;
  name?: string | null;
  startDate: Date;
  endDate: Date;
  notes?: string | null;
  mesocycleId: number;
  mesocycle: MesocycleInterface;
  sessionGoals: SessionGoalInterface[]; // Updated to reflect the new name
}

export interface SessionGoalInterface {
  id?: number;
  date: Date;
  order: number;
  duration: number; // Duration in minutes
  note: string | null; // Additional notes
  coach: string; // Coach responsible for the session goal
  microcycleId?: number; // Foreign key to the associated microcycle
  microcycle?: MicrocycleInterface; // Reference to the parent microcycle
}
