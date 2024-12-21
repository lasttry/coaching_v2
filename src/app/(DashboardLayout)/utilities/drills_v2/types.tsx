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
  Defensive = 'Defensive'
}

export interface DrawingInterface {
  showCircle: boolean;
  isDrawing: boolean;
  type?: DrawingType;
  value?: string;
}
export interface LineInterface {
  tool: string;
  points: number[];
  startX?: number;
  startY?: number;
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
