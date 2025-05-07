// Add the Initiative and TokenData types if they don't exist
export interface Initiative {
  id: string;
  name: string;
  initiative: number;
  roll?: number; // Добавляем поле roll
  isActive: boolean;
  isPlayer?: boolean;
  tokenId?: string | number;
  // Add any other needed properties
}

export interface TokenData {
  id: string;
  x: number;
  y: number;
  image?: string;
  img?: string; // Добавляем альтернативное поле для изображения
  name?: string;
  size?: number;
  // Add any other needed properties
}

// Добавляем интерфейс для сообщений чата
export interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
  type?: 'message' | 'system' | 'dice';
}

// Добавляем интерфейс для игровой сессии
export interface GameSession {
  id: string;
  name: string;
  code: string;
  dmId: string;
  players: any[]; // Можно детализировать тип игроков при необходимости
  createdAt: string;
  description?: string;
}
