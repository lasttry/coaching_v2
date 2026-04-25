export type AttendanceDefault = 'ALL' | 'NONE';

export type PracticeItemType = 'FREETEXT' | 'DRILL' | 'PLAY' | 'BREAKDOWN' | 'MY_DRILL';

export interface PracticeItemGraphicInterface {
  /** Points to {@link DrillGraphicInterface.id} on the linked drill. */
  drillGraphicId: number;
  caption: string;
  /** When `true` this graphic is printed on the first page of the plan. */
  printFirst: boolean;
  /** When `true` this graphic is printed on additional pages. */
  printOther: boolean;
  /** Hydrated server-side from the drill graphic record so the UI can
   * render the thumbnail without an extra request. Not part of what the
   * client sends back. */
  svg?: string;
}

export interface PracticeItemInterface {
  id: number;
  practiceId: number;
  order: number;
  duration: number;
  type: PracticeItemType;
  title?: string | null;
  text?: string | null;
  drillId?: number | null;
  drill?: {
    id: number;
    name?: string | null;
    svg: string;
  } | null;
  /** Practice-plan specific captions and print flags for each graphic of
   * the linked drill. Empty / `null` when the item is a free-text block
   * or the drill has no graphics. */
  graphics?: PracticeItemGraphicInterface[] | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface SavePracticeItemInput {
  id?: number | null;
  duration?: number;
  type?: PracticeItemType;
  title?: string | null;
  text?: string | null;
  drillId?: number | null;
  graphics?: Array<{
    drillGraphicId: number;
    caption: string;
    printFirst: boolean;
    printOther: boolean;
  }> | null;
}

export interface PracticeAthleteInterface {
  id: number;
  practiceId: number;
  athleteId: number;
  /** Whether the athlete was expected at the session ("Has to attend"). */
  attending: boolean;
  /** `null` while the session has not been completed, otherwise the coach
   * marks `true` / `false` to record who showed up. */
  attended?: boolean | null;
  /** Minutes by which the athlete was late when they did attend. */
  lateMinutes?: number | null;
  /** FK to a {@link ClubAttendanceReasonInterface} when absent. */
  absenceReasonId?: number | null;
  absenceNotes?: string | null;
  athlete?: {
    id: number;
    name: string;
    number?: string | null;
    photo?: string | null;
  };
}

export interface PracticeGroupTeamInterface {
  /** Stable client/server-side id (string). */
  id: string;
  name: string;
  /** Slot list. `null` slots are kept so coaches can leave gaps. */
  players: Array<number | null>;
}

export interface PracticeGroupSetInterface {
  id: string;
  name: string;
  teams: PracticeGroupTeamInterface[];
}

export interface PracticeGroupsInterface {
  sets: PracticeGroupSetInterface[];
}

export interface ClubAttendanceReasonInterface {
  id: number;
  clubId: number;
  key: string | null;
  name: string;
  order: number;
}

export interface SaveClubAttendanceReasonInput {
  id?: number;
  name: string;
  order?: number;
}

export interface PracticeInterface {
  id: number;
  clubId: number;
  teamId: number;
  date: string;
  endTime: string;
  subtitle?: string | null;
  topic: string;
  offensiveGoals?: string | null;
  defensiveGoals?: string | null;
  notes?: string | null;
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
  team?: {
    id: number;
    name: string;
    echelon?: { id: number; name: string; gender: 'MALE' | 'FEMALE' | 'COED' } | null;
  } | null;
  attendances?: PracticeAthleteInterface[];
  items?: PracticeItemInterface[];
  groups?: PracticeGroupsInterface | null;
}

export interface SavePracticeInput {
  id?: number | null;
  teamId: number;
  date: string;
  endTime: string;
  subtitle?: string | null;
  topic: string;
  offensiveGoals?: string | null;
  defensiveGoals?: string | null;
  notes?: string | null;
  completed?: boolean;
  athletes?: Array<{
    athleteId: number;
    attending: boolean;
    attended?: boolean | null;
    lateMinutes?: number | null;
    absenceReasonId?: number | null;
    absenceNotes?: string | null;
  }>;
  groups?: PracticeGroupsInterface | null;
}

export interface ClubPracticeSettingsInterface {
  id: number;
  clubId: number;
  defaultAttendanceMale: AttendanceDefault;
  defaultAttendanceFemale: AttendanceDefault;
  defaultAttendanceCoed: AttendanceDefault;
}
