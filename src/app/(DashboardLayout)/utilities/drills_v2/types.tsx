export enum DrawingType {
  Offensive = 'offensive',
  Defensive = 'defensive',
  LineMovement = 'lineMovement',
  LineDribbling = 'lineDribbling',
  LineScreen = 'lineScreen',
  LinePassing = 'linePassing',
  None = 'none',
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
  foreColor?: string;
  backgroundColor?: string;
}
