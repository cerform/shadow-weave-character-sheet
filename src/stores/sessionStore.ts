
import { create } from 'zustand';
import { DMSession, Player } from '@/contexts/SessionContext';
import { useAuth } from '@/hooks/use-auth';

// Определяем тип для состояния сессии
interface SessionStore {
  currentSession: DMSession | null;
  sessions: DMSession[];
  fetchSessions: () => Promise<DMSession[]>;
  createSession: (name: string, description?: string) => DMSession;
  joinSession: (code: string, player: { name: string, character: any }) => boolean;
  endSession: (id: string) => void;
  updateSession: (session: Partial<DMSession>) => void;
}

// Создаем хук useSessionStore, который возвращает заглушки вместо реальных функций
// чтобы избежать вызова useSession вне контекста провайдера
const useSessionStore = () => {
  // Создаем простое состояние по умолчанию
  const defaultStore: SessionStore = {
    currentSession: null,
    sessions: [],
    fetchSessions: async () => [],
    createSession: (name, description) => {
      console.warn("SessionProvider не найден. Сессия не может быть создана.");
      return {
        id: "placeholder",
        name,
        code: "DEMO",
        players: [],
        createdAt: new Date().toISOString(),
        description,
        isActive: false
      };
    },
    joinSession: () => {
      console.warn("SessionProvider не найден. Невозможно присоединиться к сессии.");
      return false;
    },
    endSession: () => {
      console.warn("SessionProvider не найден. Сессия не может быть завершена.");
    },
    updateSession: () => {
      console.warn("SessionProvider не найден. Невозможно обновить сессию.");
    },
  };

  // Пробуем импортировать SessionContext безопасно
  try {
    // Динамический импорт, чтобы избежать ошибки на этапе инициализации
    const SessionContext = require('@/contexts/SessionContext');
    
    // Проверяем, доступен ли контекст (не выбрасывает ошибку)
    if (typeof SessionContext.useSession === 'function') {
      const sessionContext = SessionContext.useSession();
      const { currentUser } = useAuth();
      
      return {
        currentSession: sessionContext.currentSession,
        sessions: sessionContext.sessions || [],
        fetchSessions: sessionContext.fetchSessions,
        createSession: (name: string, description?: string): DMSession => {
          const newSession = sessionContext.createSession(name, description);
          
          // Добавляем dmId, если пользователь авторизован
          if (currentUser?.uid) {
            const sessionWithDm = { 
              ...newSession, 
              dmId: currentUser.uid,
              isActive: true
            };
            sessionContext.updateSession(sessionWithDm);
            return sessionWithDm;
          }
          
          return newSession;
        },
        joinSession: sessionContext.joinSession,
        endSession: sessionContext.endSession,
        updateSession: sessionContext.updateSession
      };
    }
    
    return defaultStore;
  } catch (error) {
    console.warn('SessionContext не доступен, использую заглушки', error);
    return defaultStore;
  }
};

export default useSessionStore;
