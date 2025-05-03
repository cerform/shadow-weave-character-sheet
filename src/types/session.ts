
export interface Session {
  id: string;
  campaignId?: string;
  title: string;
  description: string;
  dmId: string;
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
  lastActivity?: string;
  createdAt: string;
  code?: string;
  name?: string; // Добавляем поле name
  users?: User[]; // Добавляем поле users
}

// Добавляем интерфейс User
export interface User {
  id: string;
  name: string;
  themePreference: string;
  isOnline: boolean;
  isDM: boolean;
}
