import { jsPDF } from 'jspdf'; // Import jsPDF for PDF generation

export interface GameInterface {
  id?: number;
  number: number;
  date: string;
  away: boolean;
  competition?: string;
  subcomp?: string;
  oponentId?: number;
  oponent?: TeamInterface;
  notes?: string;
  teams?: TeamInterface;
  gameAthletes: GameAthleteInterface[];
  objectives?: ObjectiveInterface[], // Add default
}

export interface ObjectiveInterface {
  id?: number; // The unique identifier for the objective
  title: string; // The title of the objective
  description?: string | null; // The description of the objective (optional)
  gameId?: number; // Foreign key linking to the game
  game?: GameInterface; // Relation to the `Game` object
  createdAt?: Date; // Timestamp when the objective was created
  updatedAt?: Date; // Timestamp when the objective was last updated
  type: ObjectiveType; // The type of objective (enum)
}

export enum ObjectiveType {
  OFFENSIVE = "OFFENSIVE",
  DEFENSIVE = "DEFENSIVE",
  TEAM = "TEAM",
  INDIVIDUAL = "INDIVIDUAL",
}

export interface TeamInterface {
  id: number;
  name: number;
  shortName: string;
  location: string;
  image: string;
  games: GameInterface[];
}

export interface GameAthleteInterface {
  gameId?: number;
  game?: GameInterface;
  athlete: AthleteInterface;
  number: string;
  period1: boolean;
  period2: boolean;
  period3 : boolean;
  period4: boolean
}

export interface AthleteInterface {
  id: number;
  number: string;
  name: string;
  birthdate: string;
  fpbNumber: number;
  idNumber: number;
  idType: string;
  active: boolean
}

export interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
}

export interface GameAthleteReport {
  id: number;
  gameId: number;
  athleteId: number;
  athlete?: AthleteInterface;
  reviewedAthleteId: number;
  reviewedAthlete?: AthleteInterface;
  teamObservation: string;
  individualObservation: string;
  timePlayedObservation: string;
}
