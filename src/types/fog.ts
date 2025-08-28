export interface FogCell {
  row: number;
  col: number;
  revealed: boolean;
}

export interface FogArea {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

export interface FogCanvasState {
  width: number;
  height: number;
  gridRows: number;
  gridCols: number;
  cellWidth: number;
  cellHeight: number;
}

export interface FogMouseEvent {
  canvasX: number;
  canvasY: number;
  gridRow: number;
  gridCol: number;
}

export interface FogRenderConfig {
  darknesOpacity: number;
  revealOpacity: number;
  lightSourceOpacity: number;
  gradientIntensity: number;
}

export interface LightSource {
  id: string;
  x: number;
  y: number;
  radius: number;
  intensity: number;
  color?: string;
  type?: 'torch' | 'lantern' | 'daylight' | 'custom';
}

export interface TokenPosition {
  id: number;
  x: number;
  y: number;
  visible: boolean;
  type: string;
}