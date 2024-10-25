import { jsPDF } from 'jspdf'; // Import jsPDF for PDF generation

export interface GameFormData {
  number?: number;
  date: string;
  away: boolean;
  competition?: string;
  subcomp?: string;
  oponentId: string | number; // Can be empty string if no selection
  notes?: string;
  athleteIds: number[]; // Selected athletes
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
  athletes?: Athlete[];
}

export interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
}
