
// Интерфейс для сообщений от сервера
export interface ServerToClientEvents {
  message: (data: ChatMessage) => void;
  diceRoll: (data: DiceRollResult) => void;
  tokenMove: (data: TokenMove) => void;
  initiative: (data: InitiativeData) => void;
  battleUpdate: (data: BattleUpdate) => void;
  userJoined: (data: UserData) => void;
  userLeft: (data: UserData) => void;
  error: (data: { message: string }) => void;
}

// Интерфейс для сообщений к серверу
export interface ClientToServerEvents {
  joinRoom: (data: { room: string; user: UserData }) => void;
  leaveRoom: (data: { room: string; user: UserData }) => void;
  sendMessage: (data: ChatMessage) => void;
  rollDice: (data: DiceRollRequest) => void;
  moveToken: (data: TokenMove) => void;
  updateInitiative: (data: InitiativeData) => void;
  updateBattle: (data: BattleUpdate) => void;
}

// Типы данных для сообщений
export interface ChatMessage {
  id?: string;
  room: string;
  user: UserData;
  text: string;
  type?: 'text' | 'system' | 'roll';
  timestamp?: number;
  rollResult?: DiceRollResult;
}

export interface UserData {
  id: string;
  name: string;
  role: 'dm' | 'player';
  character?: {
    id: string;
    name: string;
    avatar: string;
  };
}

export interface DiceRollRequest {
  room: string;
  user: UserData;
  dice: string; // e.g., "2d6+3"
  reason?: string;
  public: boolean;
}

export interface DiceRollResult {
  id?: string;
  room: string;
  user: UserData;
  dice: string;
  rolls: number[];
  total: number;
  reason?: string;
  timestamp?: number;
  public: boolean;
}

export interface TokenMove {
  room: string;
  tokenId: string;
  position: { x: number; y: number };
  userId: string;
}

export interface InitiativeData {
  room: string;
  initiative: InitiativeEntry[];
  currentTurn: number;
}

export interface InitiativeEntry {
  id: string;
  tokenId?: string;
  name: string;
  roll: number;
  active: boolean;
}

export interface BattleUpdate {
  room: string;
  active: boolean;
  round: number;
  turn: number;
}

// Интерфейс для видимой области на карте
export interface VisibleArea {
  x: number;
  y: number;
  radius: number;
  tokenId: number;
}

// Интерфейс для данных сессии
export interface SessionData {
  id: string;
  name: string;
  dmId: string;
  players: UserData[];
  status: 'active' | 'inactive' | 'paused';
  createdAt: number;
}

// Интерфейс для токенов на карте
export interface Token {
  id: string;
  name: string;
  position: { x: number; y: number };
  img: string;
  type: 'character' | 'monster' | 'npc';
  size: number; // размер токена
  ownerId: string;
  health?: {
    current: number;
    max: number;
  };
  visible: boolean;
}
