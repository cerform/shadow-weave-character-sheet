
import { Character } from './character';

export interface GameSession {
  id: string;
  name: string;
  description?: string;
  dmId: string;  // ID мастера подземелий (DM)
  players: SessionPlayer[];
  code: string;  // Код для присоединения
  map?: MapData;
  tokens?: TokenData[];
  notes?: SessionNote[];
  chat?: ChatMessage[];
  createdAt: string;
  updatedAt?: string;
  isActive: boolean;
  battleActive?: boolean;
  initiative?: Initiative[];
}

export interface SessionPlayer {
  id: string;
  userId: string;
  characterId?: string;
  character?: Character;
  name: string;
  isConnected: boolean;
  lastActivity?: string;
}

export interface MapData {
  id: string;
  name: string;
  background: string; // URL изображения
  width: number;
  height: number;
  gridSize: number;
  showGrid: boolean;
  fogOfWar?: boolean;
}

export interface TokenData {
  id: number | string;
  name: string;
  img: string;
  x: number;
  y: number;
  size: number;
  type: 'player' | 'monster' | 'npc' | 'boss';
  visible: boolean;
  hp?: number;
  maxHp?: number;
  conditions?: string[];
  characterId?: string;
  notes?: string;
}

export interface Initiative {
  id: string;
  name: string;
  roll: number;
  tokenId: number | string;
  isActive: boolean;
}

export interface SessionNote {
  id: string;
  title: string;
  content: string;
  createdBy: string;
  createdAt: string;
  isPrivate: boolean; // Видна только DM
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  characterId?: string;
  characterName?: string;
  content: string;
  timestamp: string;
  type: 'text' | 'roll' | 'system';
  rollResult?: DiceRollResult;
}

export interface DiceRollResult {
  formula: string;
  rolls: number[];
  total: number;
  reason?: string;
}

export interface VisibleArea {
  x: number;
  y: number;
  radius: number;
  tokenId: number | string;
}
