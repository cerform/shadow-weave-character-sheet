// src/game/fog/FogTypes.ts

export type FogCellState = 0 | 1 | 2; // 0 = hidden, 1 = explored, 2 = visible

export interface FogGridOptions {
  cols: number;      // grid width (columns)
  rows: number;      // grid height (rows)
  cellSize: number;  // world units per cell (px on 2D map)
}

export interface LOSBlocker {
  // Axis-aligned rectangle that blocks vision in world units (px)
  x: number; y: number; width: number; height: number;
}

export interface VisionSource {
  // Dynamic vision source (player token, torch, spell)
  x: number;          // world x (center, px)
  y: number;          // world y (center, px)
  radius: number;     // world units (px)
  angle?: number;     // facing angle in radians (optional)
  fov?: number;       // cone width in radians (optional). If missing => 360°
}

export interface FogStateSnapshot {
  grid: Uint8Array;            // flattened rows*cols (FogCellState)
  version: number;
  cols: number; rows: number;
  cellSize: number;
}

export const FOG_VERSION = 1;