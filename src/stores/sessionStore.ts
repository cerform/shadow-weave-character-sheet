
import { DMSession } from '@/contexts/SessionContext';
import { useAuth } from '@/hooks/use-auth';
import { useSession } from '@/contexts/SessionContext';

// Определяем тип для состояния сессии
interface SessionStore {
  currentSession: DMSession | null;
  sessions: DMSession[];
  fetchSessions: () => Promise<DMSession[]>;
  createSession: (name: string, description?: string) => DMSession;
  joinSession: (code: string, player: { name: string; character: any }) => boolean;
  endSession: (id: string) => void;
  updateSession: (session: Partial<DMSession>) => void;
}

// Хук, безопасно использующий контекст сессий; при отсутствии провайдера возвращает заглушки
const useSessionStore = (): SessionStore => {
  const defaultStore: SessionStore = {
    currentSession: null,
    sessions: [],
    fetchSessions: async () => [],
    createSession: (name, description) => {
      console.warn('SessionProvider не найден. Сессия не может быть создана.');
      return {
        id: 'placeholder',
        name,
        code: 'DEMO',
        players: [],
        createdAt: new Date().toISOString(),
        description,
        isActive: false,
      } as unknown as DMSession;
    },
    joinSession: () => {
      console.warn('SessionProvider не найден. Невозможно присоединиться к сессии.');
      return false;
    },
    endSession: () => {
      console.warn('SessionProvider не найден. Сессия не может быть завершена.');
    },
    updateSession: () => {
      console.warn('SessionProvider не найден. Невозможно обновить сессию.');
    },
  };

  try {
    const sessionContext = useSession();
    const { user: currentUser } = useAuth();

    return {
      currentSession: sessionContext.currentSession,
      sessions: sessionContext.sessions || [],
      fetchSessions: sessionContext.fetchSessions,
      createSession: (name: string, description?: string): DMSession => {
        const newSession = sessionContext.createSession(name, description);
        if ((currentUser as any)?.uid || (currentUser as any)?.id) {
          const uid = (currentUser as any).uid ?? (currentUser as any).id;
          const sessionWithDm = {
            ...newSession,
            dmId: uid,
            isActive: true,
          } as DMSession;
          sessionContext.updateSession(sessionWithDm);
          return sessionWithDm;
        }
        return newSession;
      },
      joinSession: sessionContext.joinSession,
      endSession: sessionContext.endSession,
      updateSession: sessionContext.updateSession,
    };
  } catch (error) {
    // Если хук useSession брошен вне провайдера – возвращаем заглушки
    console.warn('SessionContext не доступен, использую заглушки', error);
    return defaultStore;
  }
};

export default useSessionStore;
