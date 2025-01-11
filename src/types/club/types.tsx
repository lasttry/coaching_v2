import { Role } from "@prisma/client";

export interface ClubInterface {
  id?: number | undefined;
  name: string;
  shortName: string;
  location: string;
  image?: string; // Base64 string for the image
  backgroundColor?: string;
  foregroundColor?: string;
  season?: string;
}

export const RoleDisplayNames: { [key in Role]: string } = {
  [Role.ADMIN]: 'Admin',
  [Role.DIRECTOR]: 'Director',
  [Role.COACH]: 'Coach',
  [Role.PLAYER]: 'Player',
  [Role.PARENT]: 'Parent',
  [Role.TEAM_MANAGER]: 'Team Manager',
};
