
export interface VisibleArea {
  x: number;
  y: number;
  radius: number;
  tokenId: number;
}

// Экспортируем тип для эффектов области
export interface AreaEffect {
  id: string;
  type: 'circle' | 'cone' | 'square' | 'line';
  x: number;
  y: number;
  size: number;
  color: string;
  opacity?: number;
  rotation?: number;
}

// Экспортируем тип для источников света
export interface LightSource {
  id: string;
  x: number;
  y: number;
  radius: number;
  type: 'torch' | 'lantern' | 'daylight';
  color: string;
  intensity: number;
}
