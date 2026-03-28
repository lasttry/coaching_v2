import { Club, Role } from '@prisma/client';
import { VenueInterface } from '../venues/types';
import { EquipmentInterface } from '../equipment/types';

export function mapClubToInterface(club: Club): ClubInterface {
  return {
    id: club.id,
    name: club.name,
    shortName: club.shortName ?? '',
    image: club.image ?? undefined,
    backgroundColor: club.backgroundColor ?? undefined,
    foregroundColor: club.foregroundColor ?? undefined,
    createdAt: club.createdAt ?? undefined,
    updatedAt: club.updatedAt ?? undefined,
  };
}

export interface ClubInterface {
  id?: number;
  name: string;
  shortName: string;
  image?: string;
  backgroundColor?: string;
  foregroundColor?: string;

  venues?: VenueInterface[];

  equipments?: EquipmentInterface[];

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
