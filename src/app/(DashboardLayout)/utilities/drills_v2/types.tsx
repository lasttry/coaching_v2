export enum DrawingType {
  Offensive = 'offensive',
  Defensive = 'defensive',
  LineMovement = 'lineMovement',
  LineDribbling = 'lineDribbling',
  LineScreen = 'lineScreen',
  LinePassing = 'linePassing',
  None = 'none',
}
export enum PlayerType {
  Offensive = 'offensive',
  Defensive = 'Defensive',
}
export enum LineType {
  Movement = 'movement',
  Pass = 'pass',
  Screen = 'screen',
}

export interface DrawingInterface {
  showCircle: boolean;
  isDrawing: boolean;
  type?: DrawingType;
  value?: string;
}
export interface LineInterface {
  id: string;
  type: LineType;
  points: number[];
  path?: string;
  x: number;
  y: number;
}

export interface PlayerInterface {
  id: string;
  number: string;
  x: number;
  y: number;
  rotation: number;
  foreColor?: string;
  backgroundColor?: string;
  type: PlayerType;
}
