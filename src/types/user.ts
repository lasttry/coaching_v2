//import { ClubInterface } from './club/types';

export interface UserInterface {
  id: string;
  name: string | null;
  email: string;
  selectedClubId: number;
  selectedSeason: string;
  role: string;
}
