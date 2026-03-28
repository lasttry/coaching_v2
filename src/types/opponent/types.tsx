import { VenueInterface } from '../venues/types';

export interface OpponentInterface {
  id?: number;
  name: string;
  shortName: string;
  image?: string;

  fpbClubId?: number;
  fpbTeamId?: number;

  venues?: VenueInterface[];

  createdAt?: Date;
  updatedAt?: Date;
}
