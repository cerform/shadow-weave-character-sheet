
import React, { createContext, useContext, useState, ReactNode } from 'react';

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
}

interface SessionContextType {
  currentSession: DMSession | null;
  sessions: DMSession[];
  createSession: (name: string, description?: string) => DMSession;
  joinSession: (code: string, player: { name: string, character: any }) => boolean;
  endSession: (id: string) => void;
  updateSession: (session: Partial<DMSession>) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [sessions, setSessions] = useState<DMSession[]>(() => {
    const saved = localStorage.getItem('dnd-sessions');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [currentSession, setCurrentSession] = useState<DMSession | null>(null);

  // Generate a random 6 character code
  const generateSessionCode = (): string => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  // Create a new DM session
  const createSession = (name: string, description?: string): DMSession => {
    const newSession: DMSession = {
      id: Date.now().toString(),
      name,
      code: generateSessionCode(),
      players: [],
      createdAt: new Date().toISOString(),
      description
    };
    
    const updatedSessions = [...sessions, newSession];
    setSessions(updatedSessions);
    setCurrentSession(newSession);
    localStorage.setItem('dnd-sessions', JSON.stringify(updatedSessions));
    
    return newSession;
  };

  // Join an existing session as a player
  const joinSession = (code: string, player: { name: string, character: any }): boolean => {
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
    
    const updatedSessions = [...sessions];
    updatedSessions[sessionIndex] = updatedSession;
    
    setSessions(updatedSessions);
    setCurrentSession(updatedSession);
    localStorage.setItem('dnd-sessions', JSON.stringify(updatedSessions));
    
    return true;
  };

  // End a session
  const endSession = (id: string) => {
    const updatedSessions = sessions.filter(s => s.id !== id);
    setSessions(updatedSessions);
    
    if (currentSession?.id === id) {
      setCurrentSession(null);
    }
    
    localStorage.setItem('dnd-sessions', JSON.stringify(updatedSessions));
  };

  // Update session details
  const updateSession = (sessionUpdate: Partial<DMSession>) => {
    if (!currentSession || !sessionUpdate.id) return;
    
    const sessionIndex = sessions.findIndex(s => s.id === sessionUpdate.id);
    
    if (sessionIndex === -1) return;
    
    const updatedSession = {
      ...sessions[sessionIndex],
      ...sessionUpdate
    };
    
    const updatedSessions = [...sessions];
    updatedSessions[sessionIndex] = updatedSession;
    
    setSessions(updatedSessions);
    setCurrentSession(updatedSession);
    localStorage.setItem('dnd-sessions', JSON.stringify(updatedSessions));
  };

  return (
    <SessionContext.Provider
      value={{
        currentSession,
        sessions,
        createSession,
        joinSession,
        endSession,
        updateSession
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
