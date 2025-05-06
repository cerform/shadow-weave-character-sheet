
import { Timestamp } from "firebase/firestore";

export interface Session {
  id: string;
  campaignId?: string;
  title: string;
  description: string;
  dmId: string; // ID мастера, создавшего сессию
  players: string[];
  startTime: string;
  endTime?: string;
  isActive: boolean;
  notes: {
    id: string;
    content: string;
    timestamp: string;
    authorId: string;
  }[];
  mapId?: string;
  lastActivity?: string | Timestamp;
  createdAt: string;
  code?: string;
  name?: string; 
  users?: User[];
  updatedAt?: string;
}

export interface User {
  id: string;
  name: string;
  themePreference: string;
  isOnline: boolean;
  isDM: boolean;
  character?: Character; // Добавляем персонажа к пользователю
}

export interface Character {
  id: string;
  name: string;
  race: string;
  class: string;
  className?: string; // Добавляем альтернативное поле для совместимости
  level: number;
  avatarUrl?: string;
  userId?: string; // Добавляем ID пользователя
  createdAt?: string;
  updatedAt?: string;
}

// Добавляем типы для хранения персонажей
export interface CharacterStorage {
  characters: Character[];
  lastUsed?: string; // ID последнего использованного персонажа
}
