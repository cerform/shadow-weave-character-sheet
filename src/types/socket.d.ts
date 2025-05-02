
export interface VisibleArea {
  x: number;
  y: number;
  radius: number;
  tokenId: number;
}

export interface SessionData {
  id: string;
  name: string;
  dm: string;
  players: Player[];
  tokens: Token[];
  map?: string;
  chatMessages: ChatMessage[];
}

export interface Player {
  id: string;
  name: string;
  characterId?: string;
  isConnected: boolean;
}

export interface Token {
  id: string;
  name: string;
  type: "player" | "monster" | "npc" | "boss";
  img: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  ac: number;
  initiative: number;
  conditions: string[];
  resources: { [key: string]: number };
  visible: boolean;
}

export interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  type: "player" | "dm" | "system" | "roll";
  timestamp: string;
  rollResult?: number;
  rollFormula?: string;
}

// Добавьте здесь другие необходимые типы для сокет-соединений
