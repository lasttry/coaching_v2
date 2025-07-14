import { ClubInterface } from './club/types';

export interface UserInterface {
  id: number;
  name: string | null;
  email: string;
  selectedClubId: number;
  selectedSeason: string;
  role: string;
}
