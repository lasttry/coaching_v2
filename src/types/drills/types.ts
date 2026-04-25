export interface DrillTopicInterface {
  id: number;
  clubId: number;
  /** Localisation key present on auto-seeded defaults. `null` for topics
   * added by a club admin — those are shown verbatim. */
  key: string | null;
  name: string;
  order: number;
}

export interface SaveDrillTopicInput {
  id?: number;
  name: string;
  order?: number;
}

export interface DrillGraphicInterface {
  id: number;
  drillId: number;
  order: number;
  svg: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DrillInterface {
  id: number;
  title: string | null;
  name: string | null;
  svg: string | null;
  createdAt: string;
  updatedAt: string;

  clubId: number | null;
  accountId: number | null;
  account?: { id: number; name: string | null; email: string } | null;
  echelonId: number | null;
  echelon?: { id: number; name: string } | null;

  description: string | null;
  goals: string | null;
  variations: string | null;
  tips: string | null;
  defaultText: string | null;

  ballsCount: number;
  basketsCount: number;
  conesCount: number;
  extraEquipment: string | null;

  playersCount: number;
  coachesCount: number;

  typeFundamental: boolean;
  typeIndividual: boolean;
  typeTeam: boolean;

  posGuard: boolean;
  posForward: boolean;
  posCenter: boolean;

  graphics?: DrillGraphicInterface[];
  topics?: DrillTopicInterface[];
  _count?: { graphics: number };
}

export interface SaveDrillInput {
  id?: number;
  title?: string | null;
  echelonId?: number | null;
  description?: string | null;
  goals?: string | null;
  variations?: string | null;
  tips?: string | null;
  defaultText?: string | null;
  ballsCount?: number;
  basketsCount?: number;
  conesCount?: number;
  extraEquipment?: string | null;
  playersCount?: number;
  coachesCount?: number;
  typeFundamental?: boolean;
  typeIndividual?: boolean;
  typeTeam?: boolean;
  posGuard?: boolean;
  posForward?: boolean;
  posCenter?: boolean;
  topicIds?: number[];
}

export interface SaveDrillGraphicInput {
  id?: number;
  svg: string;
  notes?: string | null;
  order?: number;
}
