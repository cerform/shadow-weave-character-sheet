
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
  compactMode?: boolean;  // Добавлено поле compactMode
  isDM?: boolean;
  tokens?: Token[];
  selectedTokenId?: number;
  onSelectToken?: (id: number) => void;
}

// Обновляем типы для компонентов боя
export interface LightSource {
  id: string;
  position: { x: number; y: number }; // Добавляем position вместо x и y
  x?: number; // Для обратной совместимости
  y?: number; // Для обратной совместимости
  radius: number;
  color?: string;
  intensity?: number;
  enabled?: boolean;
  type?: string;
  attachedToTokenId?: number;
}

export interface VisibleArea {
  id: string;
  points: Array<{ x: number; y: number }>;
  type: 'rectangle' | 'circle' | 'polygon';
  x?: number; // Позиция X для областей видимости
  y?: number; // Позиция Y для областей видимости
  radius?: number; // Радиус для круглых областей видимости
  tokenId?: number; // ID токена, связанного с областью видимости
}

// Добавляем интерфейс для панелей заклинаний и компонентов
export interface SpellCastingPanelProps {
  character: Character;
  onUpdate?: (updates: Partial<Character>) => void;
}

export interface SpellPanelProps {
  character: Character;
  spells?: (string | CharacterSpell)[];
  onUpdate?: (newSpells: any) => void;
}

export interface CharacterComponentProps {
  character: Character;
  onUpdate?: (updates: Partial<Character>) => void;
}
