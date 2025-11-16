// src/vtt/types/token.ts

export interface VTTToken {
  id: string;
  name: string;
  position: [number, number]; // [x, y] in world space
  size: number; // Token size multiplier (1 = medium, 2 = large, etc.)
  color: string; // Hex color
  imageUrl?: string; // Optional token image
  isSelected?: boolean;
  hp?: number;
  maxHp?: number;
  ac?: number;
  initiative?: number;
  conditions?: string[];
  isPlayer?: boolean;
  isVisible?: boolean;
}

export interface TokenRenderConfig {
  glowIntensity: number;
  showHPBars: boolean;
  showNames: boolean;
  animationSpeed: number;
}
