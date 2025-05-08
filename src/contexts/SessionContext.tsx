
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';

export interface Player {
  id: string;
  name: string;
  character: any;
  connected: boolean;
}

export interface DMSession {
  id: string;
  name: string;
  code: string;
  players: Player[];
  createdAt: string;
  description?: string;
  dmId?: string;
  isActive?: boolean;
}

interface SessionContextType {
  currentSession: DMSession | null;
  sessions: DMSession[];
  createSession: (name: string, description?: string) => DMSession;
  joinSession: (code: string, player: { name: string, character: any }) => boolean;
  endSession: (id: string) => void;
  updateSession: (session: Partial<DMSession>) => void;
  fetchSessions: () => Promise<DMSession[]>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [sessions, setSessions] = useState<DMSession[]>([]);
  const [currentSession, setCurrentSession] = useState<DMSession | null>(null);
  const [initialized, setInitialized] = useState(false);
  const { currentUser } = useAuth();

  // Загрузка сессий при инициализации
  useEffect(() => {
    if (!initialized) {
      const savedSessions = localStorage.getItem('dnd-sessions');
      if (savedSessions) {
        setSessions(JSON.parse(savedSessions));
      }
      setInitialized(true);
    }
  }, [initialized]);

  // Сохранение сессий при изменении
  useEffect(() => {
    if (initialized && sessions.length > 0) {
      localStorage.setItem('dnd-sessions', JSON.stringify(sessions));
    }
  }, [sessions, initialized]);

  // Generate a random 6 character code
  const generateSessionCode = (): string => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  // Получение всех сессий
  const fetchSessions = useCallback(async (): Promise<DMSession[]> => {
    // В реальном приложении здесь был бы запрос к API
    return Promise.resolve(sessions);
  }, [sessions]);

  // Create a new DM session
  const createSession = useCallback((name: string, description?: string): DMSession => {
    if (!currentUser) {
      throw new Error("Пользователь не авторизован");
    }
    
    const newSession: DMSession = {
      id: Date.now().toString(),
      name,
      code: generateSessionCode(),
      players: [],
      createdAt: new Date().toISOString(),
      description,
      dmId: currentUser.id,
      isActive: true
    };
    
    setSessions(prev => [...prev, newSession]);
    setCurrentSession(newSession);
    
    return newSession;
  }, [currentUser]);

  // Join an existing session as a player
  const joinSession = useCallback((code: string, player: { name: string, character: any }): boolean => {
    const sessionIndex = sessions.findIndex(s => s.code === code);
    
    if (sessionIndex === -1) {
      return false;
    }
    
    const session = sessions[sessionIndex];
    const newPlayer: Player = {
      id: Date.now().toString(),
      name: player.name,
      character: player.character,
      connected: true
    };
    
    const updatedSession = {
      ...session,
      players: [...session.players, newPlayer]
    };
    
    setSessions(prev => {
      const updated = [...prev];
      updated[sessionIndex] = updatedSession;
      return updated;
    });
    
    setCurrentSession(updatedSession);
    
    return true;
  }, [sessions]);

  // End a session
  const endSession = useCallback((id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    
    if (currentSession?.id === id) {
      setCurrentSession(null);
    }
  }, [currentSession]);

  // Update session details
  const updateSession = useCallback((sessionUpdate: Partial<DMSession>) => {
    if (!sessionUpdate.id) return;
    
    const sessionIndex = sessions.findIndex(s => s.id === sessionUpdate.id);
    
    if (sessionIndex === -1) return;
    
    const updatedSession = {
      ...sessions[sessionIndex],
      ...sessionUpdate
    };
    
    setSessions(prev => {
      const updated = [...prev];
      updated[sessionIndex] = updatedSession;
      return updated;
    });
    
    if (currentSession?.id === sessionUpdate.id) {
      setCurrentSession(updatedSession);
    }
  }, [sessions, currentSession]);

  return (
    <SessionContext.Provider
      value={{
        currentSession,
        sessions,
        createSession,
        joinSession,
        endSession,
        updateSession,
        fetchSessions
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
