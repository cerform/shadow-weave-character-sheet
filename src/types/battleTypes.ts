
// Import common battle types from existing files
import { LightSource } from '@/types/battle';

// Token type definition
export interface Token {
  id: number;
  name: string;
  type: "player" | "monster" | "npc" | "boss";
  img: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  ac: number;
  initiative: number;
  conditions: string[];
  resources: { [key: string]: number };
  spellSlots?: { [key: string]: { used: number; max: number } };
  visible: boolean;
  size: number;
}

// Initiative entry type
export interface Initiative {
  id: number;
  tokenId: number;
  name: string;
  roll: number;
  isActive: boolean;
}

// Battle state type
export interface BattleState {
  isActive: boolean;
  round: number;
  currentInitiativeIndex: number;
}

// Map settings type
export interface MapSettings {
  fogOfWar: boolean;
  revealedCells: { [key: string]: boolean };
  revealRadius: number;
  gridVisible: boolean;
  gridOpacity: number;
  gridSize: { rows: number; cols: number };
  zoom: number;
  background: string | null;
}

// Area effect type
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

// Saved map type
export interface SavedMap {
  id: string;
  name: string;
  createdAt: number;  
  background: string | null;
  tokens: Token[];
  fogOfWar: boolean;
  revealedCells: { [key: string]: boolean };
  lighting: LightSource[];
  gridSettings: {
    visible: boolean;
    opacity: number;
    size: { rows: number; cols: number };
  };
}

// VisibleArea type
export interface VisibleArea {
  x: number;
  y: number;
  radius: number;
  tokenId: number;
}
