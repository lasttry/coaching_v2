export interface VenueInterface {
  id?: number | null;
  name: string;
  address?: string;

  clubId?: number | null;

  createdAt?: Date;
  updatedAt?: Date;
}
