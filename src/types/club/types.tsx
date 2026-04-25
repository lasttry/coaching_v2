import { Club, Role } from '@prisma/client';
import { VenueInterface } from '../venues/types';
import { EquipmentInterface } from '../equipment/types';

export function mapClubToInterface(club: Club): ClubInterface {
  return {
    id: club.id,
    name: club.name,
    shortName: club.shortName ?? '',
    image: club.image ?? undefined,
    federationLogo: club.federationLogo ?? undefined,
    backgroundColor: club.backgroundColor ?? undefined,
    foregroundColor: club.foregroundColor ?? undefined,
    courtBackground: club.courtBackground ?? undefined,
    courtKeyColor: club.courtKeyColor ?? undefined,
    courtCenterColor: club.courtCenterColor ?? undefined,
    courtLineColor: club.courtLineColor ?? undefined,
    courtMarginColor: club.courtMarginColor ?? undefined,
    courtShowLogo: club.courtShowLogo,
    courtLogoRotation: club.courtLogoRotation,
    fpbClubId: club.fpbClubId ?? undefined,
    createdAt: club.createdAt ?? undefined,
    updatedAt: club.updatedAt ?? undefined,
  };
}

export interface ClubInterface {
  id?: number;
  name: string;
  shortName: string;
  image?: string;
  federationLogo?: string;
  backgroundColor?: string;
  foregroundColor?: string;
  courtBackground?: string;
  courtKeyColor?: string;
  courtCenterColor?: string;
  courtLineColor?: string;
  courtMarginColor?: string;
  courtShowLogo?: boolean;
  courtLogoRotation?: number;
  fpbClubId?: number | null;

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
