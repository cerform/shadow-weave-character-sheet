
import { Character } from './character';

export interface User {
  id: string;
  name: string;
  themePreference: string;
  isOnline: boolean;
  isDM: boolean;
  characterIds?: string[];
  currentCharacterId?: string;
}

export interface Session {
  id: string;
  name: string;
  code: string;
  description?: string;
  dmId: string;
  users: User[];
  createdAt: string;
  lastActive: string;
  isActive: boolean;
}

export interface SessionState {
  sessions: Session[];
  currentSession: Session | null;
  currentUser: User | null;
  loading: boolean;
  error: string | null;
}
