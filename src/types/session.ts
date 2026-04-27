/**
 * Session types for Shadow Weave multiplayer system.
 *
 * IMPORTANT: Character type is imported from @/types/character — do NOT
 * define a local Character interface here. Use the canonical source.
 */
import { Character } from '@/types/character';

export interface Session {
  id: string;
  campaignId?: string;
  title: string;
  description: string;
  /** ID of the Dungeon Master who created the session */
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
  /** ISO 8601 timestamp string — Supabase compatible */
  lastActivity?: string;
  createdAt: string;
  code?: string;
  name?: string;
  users?: SessionUser[];
  updatedAt?: string;
}

export interface SessionUser {
  id: string;
  name: string;
  themePreference: string;
  isOnline: boolean;
  isDM: boolean;
  /** Player's character in this session */
  character?: Character;
}

// Legacy alias — prefer SessionUser for new code
export type User = SessionUser;

/** Lightweight character reference stored with session player slots */
export interface CharacterStorage {
  characters: Character[];
  lastUsed?: string;
}

export type { Character };
