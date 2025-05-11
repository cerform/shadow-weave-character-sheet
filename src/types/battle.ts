
export interface VisibleArea {
  x: number;
  y: number;
  radius: number;
  tokenId: number;
}

export interface Token {
  id: number;
  name: string;
  type: "player" | "monster" | "npc" | "boss";
  x: number;
  y: number;
  img: string;
  initiative?: number;
  hp?: number;
  maxHp?: number;
  ac?: number;
  conditions?: string[];
  resources?: Record<string, { max: number; used: number }>;
  visible?: boolean;
  isVisible?: boolean;
  size?: 'tiny' | 'small' | 'medium' | 'large' | 'huge' | 'gargantuan' | number;
  scale?: number;
  rotation?: number;
  characterId?: string;
  tokenColor?: string;
}

// Добавляем привязку к SessionStore
export interface TokenOwner {
  userId: string;
  userName: string;
}

// Тип для источника света
export interface LightSource {
  id: number;
  type: 'torch' | 'lantern' | 'daylight' | 'custom';
  x: number;
  y: number;
  radius: number;
  color: string;
  intensity: number;
  flickering?: boolean;
  attachedToTokenId?: number;
}
