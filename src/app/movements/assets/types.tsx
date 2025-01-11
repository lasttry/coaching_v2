export enum DrawingToolType {
  None = 'none',
  Delete = 'delete',
  Offense = 'offense',
  Defense = 'defense',
  Ball = 'ball',
  Cone = 'cone',
  Coach = 'coach',
  Area = 'area',
  LineMovement = 'lineMovement',
  LinePassing = 'linePassing',
  LineDribbling = 'lineDribbling',
  LineScreen = 'lineScreen',
  LineShooting = 'lineShooting',
  Line = 'line',
  HandOff = 'handOff',
}

export interface DrawingInterface {
  tool: DrawingToolType;
}

export interface SvgIconsInterface {
  id: string;
  type: DrawingToolType;
  x?: number;
  y?: number;
  rotation?: number;
  color?: string;
  textValue?: number;
  selected: boolean;
}
