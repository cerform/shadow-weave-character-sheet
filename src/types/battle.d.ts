
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

export interface InitiativeItem {
  id: number;
  tokenId: number;
  name: string;
  roll: number;
  isActive: boolean;
}

export interface BattleState {
  isActive: boolean;
  round: number;
  currentInitiativeIndex: number;
  initiative: InitiativeItem[];
  tokens: Token[];
  fogOfWar: boolean;
  revealedAreas?: { x: number, y: number, radius: number }[];
}

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

export interface VisibleArea {
  x: number;
  y: number;
  radius: number;
  tokenId: number;
}

// Добавляем привязку к SessionStore
export interface TokenOwner {
  userId: string;
  userName: string;
}
