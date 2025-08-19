export type FogCellState = 0 | 1 | 2; 
// 0 = скрыто, 1 = разведано, 2 = видно

export interface FogGridOptions {
  cols: number;
  rows: number;
  cellSize: number; // размер клетки в world units
}

export interface VisionSource {
  x: number;
  y: number;
  radius: number;
  angle?: number; // направление обзора (радианы)
  fov?: number;   // ширина конуса (радианы). Если нет → 360°
}

export interface LOSBlocker {
  x: number;
  y: number;
  width: number;
  height: number;
}