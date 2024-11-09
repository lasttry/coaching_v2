import { jsPDF } from 'jspdf'; // Import jsPDF for PDF generation

export interface GameFormDataInterface{
  number?: number,
  date: string,
  away: boolean,
  oponentId: number,
  competition?: string,
  subcomp?: string,
  notes?: string,
  athletes: GameFormAthletesInterface[]
}

export interface GameFormAthletesInterface{
  number: string,
  period1: boolean,
  period2: boolean,
  period3: boolean,
  period4: boolean,
  athletes: Athlete
}

export interface Team {
  id: number;
  name: string;
  shortName: string;
  image: string;
  location: string;
}

export interface Athlete {
  id: number;
  name: string;
  number: string;
  birthdate: string; // Athlete's birthdate
  fpbNumber: number;
  idNumber: number;
  gameNumber: string; // Game-specific number, initially the same as `number`
}

// Define the types for game and teams
export interface Game {
  id: number;
  number: number;
  date: string;
  away: boolean;
  competition?: string;
  subcomp?: string;
  notes?: string;
  teams?: Team;
  gameAthletes?: GameFormAthletesInterface[];
}

export interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
}
