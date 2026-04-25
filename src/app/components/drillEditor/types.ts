/* Drill editor data model.
 * All coordinates are in the court SVG viewBox units (1 unit = 1 cm).
 * Court half = 1500 x 1400, full = 1500 x 2800.
 */

export type ElementColor = string;

export type PlayerKind = 'offense' | 'defense';

/* FIBA-compatible 5 line types + 2 single-point markers.
 * Line variants draw from start → end; shooting/handoff are placed at a single point.
 */
export type ArrowVariant = 'movement' | 'passing' | 'dribbling' | 'screen' | 'line';

export type AreaVariant = 'circle' | 'square' | 'triangle';

export interface PlayerElement {
  id: string;
  kind: 'player';
  team: PlayerKind;
  number: number;
  x: number;
  y: number;
  color: ElementColor;
  /** Facing direction (degrees, clockwise, 0 = up). Used on defence to draw
   * the chevron behind the hat and to allow on-court rotation. Optional on
   * offence players for forward-compat. */
  rotation?: number;
}

export interface BallElement {
  id: string;
  kind: 'ball';
  x: number;
  y: number;
}

export interface ConeElement {
  id: string;
  kind: 'cone';
  x: number;
  y: number;
  color: ElementColor;
}

export interface CoachElement {
  id: string;
  kind: 'coach';
  x: number;
  y: number;
  color: ElementColor;
}

export interface TextElement {
  id: string;
  kind: 'text';
  x: number;
  y: number;
  text: string;
  color: ElementColor;
  size: number;
}

export interface ArrowElement {
  id: string;
  kind: 'arrow';
  variant: ArrowVariant;
  color: ElementColor;
  points: Array<{ x: number; y: number }>; // at least 2 points; first is start, last is end
}

export interface AreaElement {
  id: string;
  kind: 'area';
  variant: AreaVariant;
  /** Centre of the shape */
  x: number;
  y: number;
  /** Full width (horizontal extent) */
  width: number;
  /** Full height (vertical extent) */
  height: number;
  color: ElementColor;
  opacity: number;
}

export interface ShootingElement {
  id: string;
  kind: 'shooting';
  x: number;
  y: number;
  color: ElementColor;
}

export interface HandoffElement {
  id: string;
  kind: 'handoff';
  x: number;
  y: number;
  color: ElementColor;
}

export type DrillElement =
  | PlayerElement
  | BallElement
  | ConeElement
  | CoachElement
  | TextElement
  | ArrowElement
  | AreaElement
  | ShootingElement
  | HandoffElement;

export interface EditorState {
  version: 1;
  fullCourt: boolean;
  elements: DrillElement[];
}

export function createId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

/* Rendering order (bottom-up) matches FIBA groupings.
 * Elements are rendered in this order regardless of insertion order so that
 * areas stay behind lines, players stay on top of lines, etc.
 */
export const RENDER_ORDER = [
  'area',
  'shooting',
  'arrow',
  'cone',
  'handoff',
  'player',
  'coach',
  'ball',
  'text',
] as const;

export const GROUP_CLASS: Record<string, string> = {
  area: 'groupArea',
  shooting: 'groupShoot',
  arrow: 'groupLine',
  cone: 'groupCone',
  handoff: 'groupHandoff',
  player: 'groupPerson',
  coach: 'groupPerson',
  ball: 'groupBall',
  text: 'groupText',
};
