import { GameInterface } from '../game/types';
import { VenueInterface } from '../venues/types';

export interface OpponentInterface {
  id?: number;
  name: string;
  shortName: string;
  image?: string;

  fpbClubId?: number;
  fpbTeamId?: number;

  games?: GameInterface[];

  venues?: VenueInterface[];

  createdAt?: Date; // Timestamp when the objective was created
  updatedAt?: Date; // Timestamp when the objective was last updated
}
