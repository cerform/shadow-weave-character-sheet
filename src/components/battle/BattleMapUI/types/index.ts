import type { Vec2 } from '../utils/coordinates';
import type { EnhancedToken } from '@/stores/enhancedBattleStore';

export type { Vec2, EnhancedToken };

export type TokenType = "PC" | "NPC";

// Use EnhancedToken from store
export type Token = EnhancedToken;

export interface FogCircle {
  x: number;
  y: number;
  r: number;
}

export interface FogCell {
  x: number;
  y: number;
  revealed: boolean;
}

export interface FogController {
  grid: number[][];
  width: number;
  height: number;
  reveal: (x: number, y: number) => void;
  hide: (x: number, y: number) => void;
  toggle: (x: number, y: number) => void;
  applyCircle: (cx: number, cy: number, radius: number, reveal: boolean) => void;
  isRevealed: (x: number, y: number) => boolean;
}

export interface LogEntry {
  id: string;
  ts: string;
  text: string;
}

export type VTTTool = 
  | 'select' 
  | 'move' 
  | 'draw-rect' 
  | 'draw-circle' 
  | 'draw-line' 
  | 'text' 
  | 'measure' 
  | 'fog-reveal' 
  | 'fog-hide';

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  type: 'map' | 'tokens' | 'drawings' | 'fog' | 'background';
}

export interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  tokenId?: string;
}
