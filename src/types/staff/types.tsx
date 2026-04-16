import { StaffRole, CoachGrade } from '@prisma/client';
import { TeamInterface } from '@/types/teams/types';

export interface StaffInterface {
  id?: number;
  name: string;
  birthdate?: Date | string | null;
  tptdNumber?: number | null;
  fpbLicense?: number | null;
  grade?: CoachGrade | null;
  role: StaffRole;
  active?: boolean;
  clubId?: number;
  teams?: TeamStaffInterface[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface TeamStaffInterface {
  id?: number;
  teamId: number;
  staffId: number;
  isPrimary: boolean;
  team?: TeamInterface;
  staff?: StaffInterface;
}

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  HEAD_COACH: 'Treinador Principal',
  ASSISTANT_COACH: 'Treinador Adjunto',
  DIRECTOR: 'Diretor',
  TEAM_MANAGER: 'Delegado',
  PHYSIOTHERAPIST: 'Fisioterapeuta',
  STATISTICIAN: 'Estatístico',
  OTHER: 'Outro',
};

export const COACH_GRADE_LABELS: Record<CoachGrade, string> = {
  GRADE_1: 'Grau 1',
  GRADE_2: 'Grau 2',
  GRADE_3: 'Grau 3',
  GRADE_4: 'Grau 4',
  TRAINEE: 'Estagiário',
};
