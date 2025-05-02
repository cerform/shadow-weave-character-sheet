import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Player {
  id: string;
  name: string;
  character: any;
  connected: boolean;
  theme?: string; // Theme preference for each player
}

export interface SavedMap {
  id: string;
  name: string;
  createdAt: number;
  background: string | null;
  tokens: Token[];
  fogOfWar: boolean;
  revealedCells: { [key: string]: boolean };
  lighting: LightSource[];
  gridSettings: {
    visible: boolean;
    opacity: number;
    size: { rows: number; cols: number };
  };
}

export interface LightSource {
  id: string;
  x: number;
  y: number;
  radius: number;
  type: 'torch' | 'lantern' | 'daylight';
  color: string;
  intensity: number;
}

export interface DMSession {
  id: string;
  name: string;
  code: string;
  players: Player[];
  createdAt: string;
  description?: string;
  savedMaps?: SavedMap[];
}

interface SessionState {
  currentSession: DMSession | null;
  sessions: DMSession[];
  userType: 'dm' | 'player' | null;
  username: string | null;
  playerTheme: string;
  
  // Actions
  createSession: (name: string, description?: string) => DMSession;
  joinSession: (code: string, player: { name: string, character: any, theme?: string }) => boolean;
  endSession: (id: string) => void;
  updateSession: (session: Partial<DMSession>) => void;
  setUserType: (type: 'dm' | 'player' | null) => void;
  setUsername: (name: string | null) => void;
  setPlayerTheme: (theme: string) => void;
  
  // Map saving/loading
  saveMap: (sessionId: string, mapData: Omit<SavedMap, 'id' | 'createdAt'>) => SavedMap | null;
  loadMap: (sessionId: string, mapId: string) => SavedMap | null;
  deleteMap: (sessionId: string, mapId: string) => void;
}

// Generate a random 6 character code
const generateSessionCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      currentSession: null,
      sessions: [],
      userType: null,
      username: null,
      playerTheme: 'default',
      
      createSession: (name, description) => {
        const newSession: DMSession = {
          id: Date.now().toString(),
          name,
          code: generateSessionCode(),
          players: [],
          createdAt: new Date().toISOString(),
          description,
          savedMaps: []
        };
        
        set((state) => ({
          sessions: [...state.sessions, newSession],
          currentSession: newSession,
          userType: 'dm'
        }));
        
        return newSession;
      },
      
      joinSession: (code, player) => {
        const { sessions } = get();
        const sessionIndex = sessions.findIndex(s => s.code === code);
        
        if (sessionIndex === -1) {
          return false;
        }
        
        const session = sessions[sessionIndex];
        const newPlayer: Player = {
          id: Date.now().toString(),
          name: player.name,
          character: player.character,
          connected: true,
          theme: player.theme || get().playerTheme
        };
        
        const updatedSession = {
          ...session,
          players: [...session.players, newPlayer]
        };
        
        set((state) => {
          const updatedSessions = [...state.sessions];
          updatedSessions[sessionIndex] = updatedSession;
          
          return {
            sessions: updatedSessions,
            currentSession: updatedSession,
            userType: 'player',
            username: player.name
          };
        });
        
        return true;
      },
      
      endSession: (id) => {
        set((state) => {
          const updatedSessions = state.sessions.filter(s => s.id !== id);
          
          return {
            sessions: updatedSessions,
            currentSession: state.currentSession?.id === id ? null : state.currentSession,
            userType: state.currentSession?.id === id ? null : state.userType
          };
        });
      },
      
      updateSession: (sessionUpdate) => {
        const { sessions, currentSession } = get();
        if (!currentSession || !sessionUpdate.id) return;
        
        const sessionIndex = sessions.findIndex(s => s.id === sessionUpdate.id);
        
        if (sessionIndex === -1) return;
        
        const updatedSession = {
          ...sessions[sessionIndex],
          ...sessionUpdate
        };
        
        set((state) => {
          const updatedSessions = [...state.sessions];
          updatedSessions[sessionIndex] = updatedSession;
          
          return {
            sessions: updatedSessions,
            currentSession: updatedSession
          };
        });
      },
      
      setUserType: (type) => {
        set({ userType: type });
      },
      
      setUsername: (name) => {
        set({ username: name });
      },
      
      setPlayerTheme: (theme) => {
        set({ playerTheme: theme });
        
        // Also update the theme for the current player in the current session if applicable
        const { currentSession, username } = get();
        if (currentSession && username) {
          const playerIndex = currentSession.players.findIndex(p => p.name === username);
          if (playerIndex >= 0) {
            set((state) => {
              const updatedPlayers = [...state.currentSession!.players];
              updatedPlayers[playerIndex] = {
                ...updatedPlayers[playerIndex],
                theme
              };
              
              const updatedSession = {
                ...state.currentSession!,
                players: updatedPlayers
              };
              
              const updatedSessions = [...state.sessions];
              const sessionIndex = updatedSessions.findIndex(s => s.id === updatedSession.id);
              if (sessionIndex >= 0) {
                updatedSessions[sessionIndex] = updatedSession;
              }
              
              return {
                currentSession: updatedSession,
                sessions: updatedSessions
              };
            });
          }
        }
      },

      // Новые функции для работы с картами
      saveMap: (sessionId, mapData) => {
        const { sessions } = get();
        const sessionIndex = sessions.findIndex(s => s.id === sessionId);
        
        if (sessionIndex === -1) return null;
        
        const session = sessions[sessionIndex];
        const newMap: SavedMap = {
          ...mapData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString()
        };
        
        const savedMaps = session.savedMaps || [];
        const updatedSession = {
          ...session,
          savedMaps: [...savedMaps, newMap]
        };
        
        set((state) => {
          const updatedSessions = [...state.sessions];
          updatedSessions[sessionIndex] = updatedSession;
          
          return {
            sessions: updatedSessions,
            currentSession: state.currentSession?.id === sessionId ? updatedSession : state.currentSession
          };
        });
        
        return newMap;
      },
      
      loadMap: (sessionId, mapId) => {
        const { sessions } = get();
        const session = sessions.find(s => s.id === sessionId);
        
        if (!session || !session.savedMaps) return null;
        
        const map = session.savedMaps.find(m => m.id === mapId);
        return map || null;
      },
      
      deleteMap: (sessionId, mapId) => {
        const { sessions } = get();
        const sessionIndex = sessions.findIndex(s => s.id === sessionId);
        
        if (sessionIndex === -1 || !sessions[sessionIndex].savedMaps) return;
        
        const session = sessions[sessionIndex];
        const updatedMaps = session.savedMaps!.filter(m => m.id !== mapId);
        
        const updatedSession = {
          ...session,
          savedMaps: updatedMaps
        };
        
        set((state) => {
          const updatedSessions = [...state.sessions];
          updatedSessions[sessionIndex] = updatedSession;
          
          return {
            sessions: updatedSessions,
            currentSession: state.currentSession?.id === sessionId ? updatedSession : state.currentSession
          };
        });
      }
    }),
    {
      name: 'dnd-session-storage',
    }
  )
);

import { Token, MapSettings } from './battleStore';

// Экспортируем тип LightSource для использования в PlayBattlePage
export interface LightSource {
  id: string;
  x: number;
  y: number;
  radius: number;
  type: 'torch' | 'lantern' | 'daylight';
  color: string;
  intensity: number;
}

// Обновляем тип SavedMap для соответствия с используемыми данными
export interface SavedMap {
  id: string;
  name: string;
  createdAt: number;
  background: string | null;
  tokens: Token[];
  fogOfWar: boolean;
  revealedCells: { [key: string]: boolean };
  lighting: LightSource[];
  gridSettings: {
    visible: boolean;
    opacity: number;
    size: { rows: number; cols: number };
  };
}
