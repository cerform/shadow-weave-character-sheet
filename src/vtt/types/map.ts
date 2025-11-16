// src/vtt/types/map.ts

export interface VTTMap {
  id: string;
  sessionId: string;
  url: string;
  width: number;
  height: number;
  gridSize: number;
  name?: string;
}

export interface MapDimensions {
  worldWidth: number;
  worldHeight: number;
  imageWidth: number;
  imageHeight: number;
  gridCellSize: number;
}
