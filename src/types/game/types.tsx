import { jsPDF } from 'jspdf';
import { ClubInterface } from '../club/types';
import { VenueInterface } from '../venues/types';
import { CompetitionInterface, CompetitionSerieInterface } from '../competition/types';
import { TeamInterface } from '../teams/types';
import { AthleteInterface } from '../athlete/types';
import { GameEquipmentInterface } from '../gameEquipment/types';
import { OpponentInterface } from '../opponent/types';

import type { $Enums } from '@prisma/client';

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
  venue?: VenueInterface;

  gameAthletes: GameAthleteInterface[];
  gameEquipments?: GameEquipmentInterface[];

  objectives?: ObjectiveInterface[];
  athleteReports?: GameAthleteReport[];

  refereeMain?: string;
  referee1?: string;
  scorer?: string;
  timekeeper?: string;
  shotClock?: string;
  opponentResultsCount?: number;
  speech?: string | null;
  completed?: boolean;

  fpbGameId?: number | null;

  createdAt?: Date;
  updatedAt?: Date;

  image1?: string;
  image2?: string;
  image3?: string;
  image4?: string;
}

export interface ObjectiveInterface {
  id?: number;
  title: string;
  description?: string | null;
  gameId?: number;
  game?: GameInterface;
  type: ObjectiveType;

  createdAt?: Date;
  updatedAt?: Date;
}

export type ObjectiveType = $Enums.ObjectiveType;
export type Size = $Enums.Size;

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
