import type { GameInterface } from '../game/types';
import type { AthleteInterface } from '../athlete/type';
import type { EquipmentInterface } from '../equipment/type';

export interface GameEquipmentInterface {
  id?: number;
  gameId: number;
  athleteId: number;
  equipmentId: number;

  game?: GameInterface; // só quando includeres via Prisma
  athlete?: AthleteInterface; // idem
  equipment?: EquipmentInterface; // idem
}
