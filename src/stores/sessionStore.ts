
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { socketService } from '@/services/socket';
import type { Character } from '@/types/character';

export interface Player {
  id: string;
  name: string;
  character: Character | null;
  connected: boolean;
}

export interface Session {
  id: string;
  name: string;
  code: string;
  dmId: string;
  players: Player[];
  createdAt: string;
  description?: string;
}

export interface SessionState {
  sessions: Session[];
  currentSession: Session | null;
  loading: boolean;
  error: string | null;
  characters: Character[];
  currentUser: { id: string; name: string; isDM: boolean } | null;
  
  // Methods
  fetchSessions: () => Promise<Session[]>;
  createSession: (name: string, description?: string) => Session;
  joinSession: (code: string, character: any) => boolean;
  endSession: (sessionId: string) => void;
  fetchCharacters: () => Promise<Character[]>;
  deleteCharacter: (id: string) => Promise<void>;
  clearAllCharacters: () => void;
  
  // Internal actions
  setCurrentSession: (session: Session | null) => void;
  addPlayerToSession: (sessionId: string, player: Player) => void;
  removePlayerFromSession: (sessionId: string, playerId: string) => void;
}

const useSessionStore = create<SessionState>((set, get) => ({
  sessions: [],
  currentSession: null,
  loading: false,
  error: null,
  characters: [],
  currentUser: null,

  fetchSessions: async () => {
    try {
      set({ loading: true });
      // Mock fetching sessions from localStorage for now
      const savedSessions = localStorage.getItem('dnd-sessions');
      const sessions = savedSessions ? JSON.parse(savedSessions) : [];
      set({ sessions, loading: false });
      return sessions;
    } catch (error) {
      set({ error: 'Failed to fetch sessions', loading: false });
      return [];
    }
  },

  createSession: (name, description) => {
    const newSession: Session = {
      id: uuidv4(),
      name,
      code: Math.random().toString(36).substring(2, 8).toUpperCase(),
      dmId: get().currentUser?.id || 'unknown',
      players: [],
      createdAt: new Date().toISOString(),
      description
    };
    
    const updatedSessions = [...get().sessions, newSession];
    set({ sessions: updatedSessions, currentSession: newSession });
    
    // Save to localStorage
    localStorage.setItem('dnd-sessions', JSON.stringify(updatedSessions));
    
    return newSession;
  },

  joinSession: (code, character) => {
    try {
      const sessionToJoin = get().sessions.find(s => s.code === code);
      
      if (!sessionToJoin) {
        set({ error: 'Session not found' });
        return false;
      }
      
      const player: Player = {
        id: uuidv4(),
        name: character.name || 'Unknown Player',
        character,
        connected: true
      };
      
      get().addPlayerToSession(sessionToJoin.id, player);
      set({ currentSession: sessionToJoin });
      
      // Connect to socket if needed
      socketService.connect(code, player.name);
      
      return true;
    } catch (error) {
      set({ error: 'Failed to join session' });
      return false;
    }
  },

  endSession: (sessionId) => {
    const sessions = get().sessions.filter(s => s.id !== sessionId);
    set({ 
      sessions, 
      currentSession: get().currentSession?.id === sessionId ? null : get().currentSession 
    });
    
    localStorage.setItem('dnd-sessions', JSON.stringify(sessions));
  },

  fetchCharacters: async () => {
    try {
      set({ loading: true });
      // Mock fetching characters from localStorage
      const savedChars = localStorage.getItem('dnd-characters');
      const characters = savedChars ? JSON.parse(savedChars) : [];
      set({ characters, loading: false });
      return characters;
    } catch (error) {
      set({ error: 'Failed to fetch characters', loading: false });
      return [];
    }
  },

  deleteCharacter: async (id) => {
    try {
      const updatedCharacters = get().characters.filter(char => char.id !== id);
      set({ characters: updatedCharacters });
      localStorage.setItem('dnd-characters', JSON.stringify(updatedCharacters));
    } catch (error) {
      set({ error: 'Failed to delete character' });
    }
  },

  clearAllCharacters: () => {
    set({ characters: [] });
    localStorage.removeItem('dnd-characters');
  },

  setCurrentSession: (session) => {
    set({ currentSession: session });
  },

  addPlayerToSession: (sessionId, player) => {
    const updatedSessions = get().sessions.map(session => {
      if (session.id === sessionId) {
        return {
          ...session,
          players: [...session.players, player]
        };
      }
      return session;
    });
    
    set({ sessions: updatedSessions });
    localStorage.setItem('dnd-sessions', JSON.stringify(updatedSessions));
  },

  removePlayerFromSession: (sessionId, playerId) => {
    const updatedSessions = get().sessions.map(session => {
      if (session.id === sessionId) {
        return {
          ...session,
          players: session.players.filter(p => p.id !== playerId)
        };
      }
      return session;
    });
    
    set({ sessions: updatedSessions });
    localStorage.setItem('dnd-sessions', JSON.stringify(updatedSessions));
  }
}));

export default useSessionStore;
