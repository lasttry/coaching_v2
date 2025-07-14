import { Role } from '@prisma/client';
import { GameInterface } from '../games/types';

export interface VenueInterface {
  id?: number | null;
  name: string;
  address?: string

  clubId?: number | null;
  club?: ClubInterface | null;

  games?: GameInterface[];

  createdAt?: Date;
  updatedAt?: Date;
}

export interface ClubInterface {
  id?: number;
  name: string;
  shortName: string;
  image?: string; // Base64 string for the image
  backgroundColor?: string;
  foregroundColor?: string;
  season?: string;

  venues?: VenueInterface[];

  createdAt?: Date;
  updatedAt?: Date;
}

export const RoleDisplayNames: { [key in Role]: string } = {
  [Role.ADMIN]: 'Admin',
  [Role.DIRECTOR]: 'Director',
  [Role.COACH]: 'Coach',
  [Role.PLAYER]: 'Player',
  [Role.PARENT]: 'Parent',
  [Role.TEAM_MANAGER]: 'Team Manager',
};
