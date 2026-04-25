import type { ArrowVariant, PlayerKind } from './types';

/* Palette from the FIBA Europe reference. Kept for backward-compatible
 * swatch grids (e.g. the arrow colour picker inside the selection editor). */
export const COLOR_PALETTE: string[] = [
  '#6C85A8', // blue-grey
  '#8C5A6B', // plum
  '#555555', // dark grey
  '#A9A9A9', // light grey
  '#F5F07A', // yellow
  '#E17870', // coral
  '#A8E1A0', // light green (default offense)
  '#AEDCF2', // sky blue (default defense)
];

/* A curated "basic" palette shown first in the editor colour picker. These
 * are the swatches the user sees by default; custom colours selected through
 * the colour input live in a separate "recent" section. */
export const BASIC_COLORS: string[] = [
  '#000000', // black
  '#ffffff', // white
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#0ea5e9', // cyan / light blue
  '#3b82f6', // blue
  '#1d4ed8', // dark blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#78350f', // brown
];

/* FIBA-accurate palette */
export const DEFAULT_OFFENSE_COLOR = '#003366';
export const DEFAULT_DEFENSE_COLOR = '#58001d';
export const DEFAULT_COACH_COLOR = '#de4814';
export const DEFAULT_TEXT_COLOR = '#000000';
export const DEFAULT_LINE_COLOR = '#000000';
export const DEFAULT_CONE_COLOR = '#e44b2f';
export const DEFAULT_AREA_COLOR = '#ffff00';

export const COURT_WIDTH = 1500; // cm
export const HALF_COURT_HEIGHT = 1400; // cm
export const FULL_COURT_HEIGHT = 2800; // cm

export const TOOL_IDS = [
  'select',
  'eraser',
  'offense',
  'defense',
  'ball',
  'cone',
  'coach',
  'text',
  'area',
  'movement',
  'passing',
  'dribbling',
  'screen',
  'line',
  'shooting',
  'handoff',
] as const;
export type ToolId = (typeof TOOL_IDS)[number];

/* Line tools correspond one-to-one to an ArrowVariant. */
export const LINE_TOOLS: ToolId[] = ['movement', 'passing', 'dribbling', 'screen', 'line'];

export const ARROW_VARIANTS: ArrowVariant[] = [
  'movement',
  'passing',
  'dribbling',
  'screen',
  'line',
];

export function defaultColorForTeam(team: PlayerKind): string {
  return team === 'offense' ? DEFAULT_OFFENSE_COLOR : DEFAULT_DEFENSE_COLOR;
}

/* Tool colour buckets — each placement tool maps to one of these keys so
 * the colour picker can remember a distinct colour per element family. */
export type ColorKey = 'offense' | 'defense' | 'coach' | 'text' | 'cone' | 'area' | 'line';

export function colorKeyForTool(tool: ToolId): ColorKey {
  switch (tool) {
    case 'offense':
      return 'offense';
    case 'defense':
      return 'defense';
    case 'coach':
      return 'coach';
    case 'text':
      return 'text';
    case 'cone':
      return 'cone';
    case 'area':
      return 'area';
    default:
      // movement / passing / dribbling / screen / line / shooting / handoff
      return 'line';
  }
}

export const DEFAULT_TOOL_COLORS: Record<ColorKey, string> = {
  offense: DEFAULT_OFFENSE_COLOR,
  defense: DEFAULT_DEFENSE_COLOR,
  coach: DEFAULT_COACH_COLOR,
  text: DEFAULT_TEXT_COLOR,
  cone: DEFAULT_CONE_COLOR,
  area: DEFAULT_AREA_COLOR,
  line: DEFAULT_LINE_COLOR,
};
