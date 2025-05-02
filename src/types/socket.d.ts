
export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: number;
  type: 'message' | 'roll' | 'system';
  rollResult?: RollResult;
}

export interface RollResult {
  formula: string;
  rolls: number[];
  total: number;
  modifier: number;
  critical?: boolean;
  fumble?: boolean;
}

export interface Player {
  id: string;
  name: string;
  character?: {
    name: string;
    class: string;
    level: number;
    avatar?: string;
  };
  isHost: boolean;
  isConnected: boolean;
}

export interface SessionData {
  id: string;
  name: string;
  code: string;
  players: Player[];
  battleMap?: {
    background: string;
    tokens: Token[];
    fogOfWar: boolean[][];
  };
  initiative?: InitiativeOrder[];
}

export interface Token {
  id: string;
  name: string;
  type: 'player' | 'monster' | 'npc' | 'object';
  x: number;
  y: number;
  size: number;
  img: string;
  hp?: number;
  maxHp?: number;
  ac?: number;
  conditions?: string[];
  notes?: string;
  isVisible: boolean;
}

export interface InitiativeOrder {
  id: string;
  tokenId: string;
  name: string;
  roll: number;
  active: boolean;
}
