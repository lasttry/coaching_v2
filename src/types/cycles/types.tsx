export interface Macrocycle {
  id: number;
  name?: string | null;
  number?: number | null;
  startDate: Date;
  endDate: Date;
  notes?: string | null;
  mesocycles: Mesocycle[];
}

export interface Mesocycle {
  id: number;
  number?: number | null;
  name?: string | null;
  startDate: Date;
  endDate: Date;
  notes?: string | null;
  macrocycleId?: number;
  macrocycle?: Macrocycle;
  microcycles?: Microcycle[];
}

export interface Microcycle {
  id: number;
  number?: number | null;
  name?: string | null;
  startDate: Date;
  endDate: Date;
  notes?: string | null;
  mesocycleId: number;
  mesocycle: Mesocycle;
  sessionGoals: SessionGoal[]; // Updated to reflect the new name
}

export interface SessionGoal {
  id?: number;
  sessionDate?: Date;
  duration: number; // Duration in minutes
  note: string | null; // Additional notes
  coach: string; // Coach responsible for the session goal
  microcycleId?: number; // Foreign key to the associated microcycle
  microcycle?: Microcycle; // Reference to the parent microcycle
}
