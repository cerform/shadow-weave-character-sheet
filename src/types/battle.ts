import { Character } from './character';

export interface Token {
  id: number;
  characterId?: string;
  name: string;
  type: 'player' | 'monster' | 'npc';
  hp: {
    current: number;
    max: number;
    temp?: number;
  };
  initiative?: number;
  position: {
    x: number;
    y: number;
  };
  size: 'tiny' | 'small' | 'medium' | 'large' | 'huge' | 'gargantuan';
  color?: string;
  conditions?: string[];
  image?: string;
  isVisible?: boolean;
  isActive?: boolean;
  notes?: string;
}

export interface BattleMap {
  id: string;
  name: string;
  background?: string;
  grid?: {
    enabled: boolean;
    size: number;
    color: string;
    opacity: number;
  };
  tokens: Token[];
  size: {
    width: number;
    height: number;
  };
  fog?: {
    enabled: boolean;
    areas: Array<{
      type: 'rectangle' | 'circle' | 'polygon';
      points: Array<{x: number, y: number}>;
      revealed: boolean;
    }>;
  };
  annotations?: Array<{
    id: string;
    type: 'text' | 'line' | 'arrow' | 'circle' | 'rectangle';
    position: {
      x: number;
      y: number;
    };
    text?: string;
    color: string;
    size: number;
    points?: Array<{x: number, y: number}>;
  }>;
  lastUpdated?: string;
}

export interface DicePanelProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
  compactMode?: boolean;
  isDM?: boolean;
  tokens?: Token[];
  selectedTokenId?: number;
  onSelectToken?: (id: number) => void;
}

// Добавляем недостающие типы для компонентов боя
export interface LightSource {
  id: string;
  position: { x: number; y: number };
  radius: number;
  color?: string;
  intensity?: number;
  enabled?: boolean;
}

export interface VisibleArea {
  id: string;
  points: Array<{ x: number; y: number }>;
  type: 'rectangle' | 'circle' | 'polygon';
}
