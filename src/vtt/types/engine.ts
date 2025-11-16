// src/vtt/types/engine.ts

export interface VTTConfig {
  sessionId: string;
  isDM: boolean;
  gridSize?: number;
  mapUrl?: string | null;
}

export interface VTTState {
  initialized: boolean;
  loading: boolean;
  error: string | null;
}
