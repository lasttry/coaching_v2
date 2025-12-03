import { AthletePreferredNumberInterface } from '../athletePreferredNumber/type';
import { Size } from '../game/types';

export interface AthleteInterface {
  id: number | null;
  number?: string;
  name: string;
  birthdate: string;
  fpbNumber?: number | null;
  idNumber?: number | null;
  idType?: IdTypeEnum | undefined;
  active: boolean;
  clubId?: number;
  shirtSize: Size;

  preferredNumbers?: AthletePreferredNumberInterface[];
}

export enum IdTypeEnum {
  PASSPORT = 'PASSPORT',
  NATIONAL_ID = 'NATIONAL_ID',
  OTHER = 'OTHER',
}
