
import { create } from 'zustand';
import { useSession, DMSession, Player } from '@/contexts/SessionContext';
import { useAuth } from '@/hooks/use-auth';

interface SessionStore {
  currentSession: DMSession | null;
  sessions: DMSession[];
  fetchSessions: () => Promise<DMSession[]>;
  createSession: (name: string, description?: string) => DMSession;
  joinSession: (code: string, player: { name: string, character: any }) => boolean;
  endSession: (id: string) => void;
  updateSession: (session: Partial<DMSession>) => void;
}

const useSessionStore = (): SessionStore => {
  const session = useSession();
  const { currentUser } = useAuth();
  
  return {
    currentSession: session.currentSession,
    sessions: session.sessions,
    fetchSessions: session.fetchSessions,
    createSession: (name: string, description?: string): DMSession => {
      const newSession = session.createSession(name, description);
      
      // Добавляем dmId, если пользователь авторизован
      if (currentUser) {
        const sessionWithDm = { 
          ...newSession, 
          dmId: currentUser.id,
          isActive: true
        };
        session.updateSession(sessionWithDm);
        return sessionWithDm;
      }
      
      return newSession;
    },
    joinSession: session.joinSession,
    endSession: session.endSession,
    updateSession: session.updateSession
  };
};

export default useSessionStore;
