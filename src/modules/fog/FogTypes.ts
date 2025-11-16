export type FogMode = 'reveal' | 'hide';

export interface FogBrushConfig {
  mode: FogMode;
  radius: number;
}

export interface FogCell {
  x: number;
  y: number;
  revealed: boolean;
}

export interface FogEngineState {
  width: number;
  height: number;
  grid: number[][];
}
