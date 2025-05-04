
import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface SessionContextType {
  session: any | null;
  addCharacterToSession: (character: any) => Promise<void>;
  removeCharacterFromSession: (characterId: string) => Promise<void>;
}

export const SessionContext = createContext<SessionContextType>({
  session: null,
  addCharacterToSession: async () => {},
  removeCharacterFromSession: async () => {},
});

interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const [session, setSession] = useState<any | null>(null);

  // Load session from storage on mount
  useEffect(() => {
    const loadSession = () => {
      try {
        const sessionData = localStorage.getItem('active-session');
        if (sessionData) {
          setSession(JSON.parse(sessionData));
        }
      } catch (error) {
        console.error('Error loading session:', error);
      }
    };

    loadSession();
  }, []);

  // Add character to session
  const addCharacterToSession = async (character: any): Promise<void> => {
    try {
      // In a real implementation, this would make an API call
      // For now, we'll just update local state
      const newSession = {
        ...session,
        characterId: character.id,
        character: character
      };

      setSession(newSession);
      localStorage.setItem('active-session', JSON.stringify(newSession));
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error adding character to session:', error);
      return Promise.reject(error);
    }
  };

  // Remove character from session
  const removeCharacterFromSession = async (characterId: string): Promise<void> => {
    try {
      // In a real implementation, this would make an API call
      // For now, we'll just update local state
      const newSession = {
        ...session,
        characterId: null,
        character: null
      };

      setSession(newSession);
      localStorage.setItem('active-session', JSON.stringify(newSession));
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error removing character from session:', error);
      return Promise.reject(error);
    }
  };

  return (
    <SessionContext.Provider
      value={{ session, addCharacterToSession, removeCharacterFromSession }}
    >
      {children}
    </SessionContext.Provider>
  );
};
