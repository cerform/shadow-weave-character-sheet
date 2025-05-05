export interface UserProfile {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt: string;
  lastLoginAt?: string;
  isDM: boolean;
  settings?: UserSettings;
  characters?: string[]; // ID персонажей
  campaigns?: string[]; // ID кампаний
  sessionHistory?: SessionHistoryItem[];
}

export interface DMMaster {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt: string;
  lastLoginAt?: string;
  campaigns: CampaignInfo[];
  players?: PlayerInfo[];
  maps?: string[]; // ID или URL карт
  tokens?: string[]; // ID или URL токенов
  customAssets?: CustomAsset[];
}

export interface PlayerInfo {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  characters: string[]; // ID персонажей
  isActive: boolean;
}

export interface CampaignInfo {
  id: string;
  dmId?: string; // Добавляем ID ведущего
  name: string;
  description?: string;
  createdAt: string;
  lastSessionAt?: string;
  players: string[]; // ID игроков
  isActive: boolean;
  sessions: string[]; // ID сессий
}

export interface SessionHistoryItem {
  id: string;
  campaignId: string;
  campaignName: string;
  date: string;
  duration: number; // в минутах
  dmId: string;
  summary?: string;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: boolean;
  diceAnimation: boolean;
  audioEffects: boolean;
  autoSave: boolean;
}

export interface CustomAsset {
  id: string;
  name: string;
  type: 'map' | 'token' | 'avatar' | 'icon' | 'other';
  url: string;
  thumbnailUrl?: string;
  uploadedAt: string;
  tags?: string[];
  isPublic: boolean;
}

// Обновляем тип User, добавив недостающие поля
export interface User {
  id: string;
  name?: string;
  themePreference?: string;
  isOnline?: boolean;
  isDM?: boolean;
  username?: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  emailVerified?: boolean;
}
