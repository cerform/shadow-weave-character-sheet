
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

// Реэкспортируем типы из .d.ts файла для полной совместимости
export type { Token, InitiativeItem } from '@/types/battle.d';
