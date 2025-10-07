import { jsPDF } from 'jspdf'; // Import jsPDF for PDF generation
import { ClubInterface, VenueInterface } from '../club/types';
import { CompetitionInterface, CompetitionSerieInterface } from '../competition/types';
import { TeamInterface } from '../teams/types';
import { Venue } from '@prisma/client';

export interface GameInterface {
  clubId: number;
  club?: ClubInterface | null;
  id: number | null;
  number?: number;
  date: Date;
  away: boolean;
  notes?: string | null;

  competitionId?: number;
  competition?: CompetitionInterface;
  competitionSerieId?: number;
  competitionSerie?: CompetitionSerieInterface;
  teamId?: number;
  team?: TeamInterface;

  opponentId?: number | null;
  opponent?: OpponentInterface;

  venueId?: number | null;
  venue?: Venue;

  gameAthletes: GameAthleteInterface[];
  objectives?: ObjectiveInterface[]; // Add default
  athleteReports?: GameAthleteReport[];

  refereeMain?: string;
  referee1?: string;
  scorer?: string;
  timekeeper?: string;
  shotClock?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface ObjectiveInterface {
  id?: number; // The unique identifier for the objective
  title: string; // The title of the objective
  description?: string | null; // The description of the objective (optional)
  gameId?: number; // Foreign key linking to the game
  game?: GameInterface; // Relation to the `Game` object
  type: ObjectiveType; // The type of objective (enum)

  createdAt?: Date; // Timestamp when the objective was created
  updatedAt?: Date; // Timestamp when the objective was last updated
}

/* eslint-disable no-unused-vars */
export enum ObjectiveType {
  OFFENSIVE = 'OFFENSIVE',
  DEFENSIVE = 'DEFENSIVE',
  TEAM = 'TEAM',
  INDIVIDUAL = 'INDIVIDUAL',
}
/* eslint-enable no-unused-vars */

export enum Size {
  S = "S",
  M = "M",
  L = "L",
  XL = "XL",
  XXL = "XXL"
}

export interface OpponentInterface {
  id?: number;
  name: string;
  shortName: string;
  image?: string;

  games?: GameInterface[];

  venues?: VenueInterface[];

  createdAt?: Date; // Timestamp when the objective was created
  updatedAt?: Date; // Timestamp when the objective was last updated
}

export interface GameAthleteInterface {
  athleteId: number | null;
  athlete: AthleteInterface | null;
  gameId: number | null;
  game: GameInterface | null;

  selected?: boolean | undefined | null;

  number: string;
  period1: boolean;
  period2: boolean;
  period3: boolean;
  period4: boolean;
}

export interface AthleteInterface {
  id: number | null;
  number?: string;
  name: string;
  birthdate: string;
  fpbNumber?: number | null;
  idNumber?: number | null;
  idType?: string | null;
  active: boolean;
  clubId?: number;
  shirtSize: AthleteSize
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
