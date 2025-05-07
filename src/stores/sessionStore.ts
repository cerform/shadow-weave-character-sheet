
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

// Создаем хранилище сессий с помощью Zustand
const useSessionStore = create<SessionStore>((set, get) => ({
  currentSession: null,
  sessions: [],
  
  fetchSessions: async () => {
    try {
      // Попытка загрузки сессий из localStorage
      const savedSessions = localStorage.getItem('dnd-sessions');
      const sessions = savedSessions ? JSON.parse(savedSessions) : [];
      set({ sessions });
      return sessions;
    } catch (error) {
      console.error("Ошибка при загрузке сессий:", error);
      return [];
    }
  },
  
  createSession: (name, description) => {
    try {
      // Получаем текущего пользователя
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      // Генерируем код сессии
      const generateSessionCode = (): string => {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
      };
      
      // Создаем новую сессию
      const newSession: DMSession = {
        id: Date.now().toString(),
        name,
        code: generateSessionCode(),
        players: [],
        createdAt: new Date().toISOString(),
        description,
        dmId: currentUser?.uid,
        isActive: true
      };
      
      // Обновляем состояние
      const updatedSessions = [...get().sessions, newSession];
      set({ 
        sessions: updatedSessions,
        currentSession: newSession
      });
      
      // Сохраняем в localStorage
      localStorage.setItem('dnd-sessions', JSON.stringify(updatedSessions));
      
      return newSession;
    } catch (error) {
      console.error("Ошибка при создании сессии:", error);
      throw error;
    }
  },
  
  joinSession: (code, player) => {
    try {
      const sessions = get().sessions;
      const sessionIndex = sessions.findIndex(s => s.code === code);
      
      if (sessionIndex === -1) {
        return false;
      }
      
      const session = {...sessions[sessionIndex]};
      const newPlayer: Player = {
        id: Date.now().toString(),
        name: player.name,
        character: player.character,
        connected: true
      };
      
      // Добавляем игрока
      session.players = [...session.players, newPlayer];
      
      // Обновляем состояние
      const updatedSessions = [...sessions];
      updatedSessions[sessionIndex] = session;
      
      set({ 
        sessions: updatedSessions,
        currentSession: session
      });
      
      // Сохраняем в localStorage
      localStorage.setItem('dnd-sessions', JSON.stringify(updatedSessions));
      
      return true;
    } catch (error) {
      console.error("Ошибка при присоединении к сессии:", error);
      return false;
    }
  },
  
  endSession: (id) => {
    try {
      const sessions = get().sessions;
      const sessionIndex = sessions.findIndex(s => s.id === id);
      
      if (sessionIndex !== -1) {
        // Помечаем сессию как неактивную
        const updatedSessions = [...sessions];
        updatedSessions[sessionIndex] = {
          ...updatedSessions[sessionIndex],
          isActive: false
        };
        
        set({ 
          sessions: updatedSessions,
          currentSession: get().currentSession?.id === id ? null : get().currentSession
        });
        
        // Сохраняем в localStorage
        localStorage.setItem('dnd-sessions', JSON.stringify(updatedSessions));
      }
    } catch (error) {
      console.error("Ошибка при завершении сессии:", error);
    }
  },
  
  updateSession: (sessionUpdate) => {
    try {
      if (!sessionUpdate.id) return;
      
      const sessions = get().sessions;
      const sessionIndex = sessions.findIndex(s => s.id === sessionUpdate.id);
      
      if (sessionIndex !== -1) {
        // Обновляем сессию
        const updatedSessions = [...sessions];
        updatedSessions[sessionIndex] = {
          ...updatedSessions[sessionIndex],
          ...sessionUpdate
        };
        
        set({ 
          sessions: updatedSessions,
          currentSession: get().currentSession?.id === sessionUpdate.id 
            ? updatedSessions[sessionIndex] 
            : get().currentSession
        });
        
        // Сохраняем в localStorage
        localStorage.setItem('dnd-sessions', JSON.stringify(updatedSessions));
      }
    } catch (error) {
      console.error("Ошибка при обновлении сессии:", error);
    }
  }
}));

export default useSessionStore;
