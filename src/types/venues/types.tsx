import { ClubInterface } from '../club/types';
import { GameInterface } from '../game/types';

export interface VenueInterface {
  id?: number | null;
  name: string;
  address?: string;

  clubId?: number | null;
  club?: ClubInterface | null;

  games?: GameInterface[];

  createdAt?: Date;
  updatedAt?: Date;
}
