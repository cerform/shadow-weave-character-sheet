// VTT Fog of War types
export interface VTTFogCell {
  x: number;
  y: number;
  revealed: number; // 0-255: 0 = hidden, 255 = fully revealed
}

export interface VTTFogConfig {
  gridWidth: number;
  gridHeight: number;
  color: { r: number; g: number; b: number };
  opacity: number;
  edgeSoftness: number;
  animationSpeed: number;
}

export interface FogBrush {
  mode: 'reveal' | 'hide';
  radius: number; // 1-8 tiles
  strength: number; // 0-1
}

export interface FogChangeEvent {
  sessionId: string;
  mapId: string;
  cells: VTTFogCell[];
}
