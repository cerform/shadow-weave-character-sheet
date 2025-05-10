
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

// Тип для источника света
export interface LightSource {
  id: number;
  type: 'torch' | 'lantern' | 'daylight' | 'custom';
  x: number;
  y: number;
  radius: number;
  color: string;
  intensity: number;
  attachedToTokenId?: number;
}

// Экспортируем Token и InitiativeItem напрямую
export interface Token {
  id: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
  name: string;
  img: string;
  isSelected?: boolean;
  isPlayer?: boolean;
  currentHP?: number;
  maxHP?: number;
  hp?: number;
  maxHp?: number;
  initiative?: number;
  tokenType?: string;
  type?: string;
  conditions?: string[];
  ac?: number;
  resources?: Record<string, any>;
  visible?: boolean;
  size?: number;
}

export interface InitiativeItem {
  id: number;
  tokenId: number;
  name: string;
  roll: number;
  isActive: boolean;
}
