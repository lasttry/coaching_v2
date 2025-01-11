import { ClubInterface } from '../club/types';
import { Role } from '@prisma/client';

export interface AccountInterface {
  id?: number | undefined;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  image?: string; // Base64 string for the image
  clubs?: ClubInterface[];
  defaultClubId: number;
}

export interface AccountClubRoleInterface {
  accountClubId: number;
  role: Role;
}

export interface AccountClubInterface {
  id: number;
  name: string;
  email: string;
  roles: Role[];
}
