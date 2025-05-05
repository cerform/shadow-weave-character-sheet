
import { create } from 'zustand';
import { db, auth } from '@/services/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  setDoc, 
  updateDoc, 
  addDoc, 
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';

// Определение типов для улучшения типизации
interface User {
  id: string;
  name: string;
  isDM: boolean;
  character?: any;
}

interface Session {
  id: string;
  name: string;
  description: string;
  code: string;
  creatorId: string;
  creatorName: string;
  createdAt: any;
  users: User[];
}

interface SessionStore {
  currentUser: any | null;
  currentSession: any | null;
  sessions: any[];
  characters: any[];
  loading: boolean;
  error: string | null;
  
  // Методы
  fetchSessions: () => Promise<void>;
  fetchCharacters: () => Promise<void>;
  createSession: (name: string, description: string) => Promise<any>;
  joinSession: (sessionCode: string, playerName: string, character?: any) => Promise<boolean>;
  updateUserTheme: (userId: string, theme: string) => Promise<void>;
  deleteCharacter: (characterId: string) => Promise<boolean>;
  clearAllCharacters: () => Promise<boolean>;
  endSession: (sessionId: string) => Promise<boolean>;
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  currentUser: null,
  currentSession: null,
  sessions: [],
  characters: [],
  loading: false,
  error: null,

  fetchSessions: async () => {
    try {
      set({ loading: true });
      const user = auth.currentUser;
      
      if (!user) {
        set({ loading: false });
        return;
      }
      
      // Получаем сессии, созданные этим пользователем
      const sessionsQuery = query(collection(db, 'sessions'), where('creatorId', '==', user.uid));
      const sessionsSnapshot = await getDocs(sessionsQuery);
      
      const sessionsData = sessionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      set({ sessions: sessionsData, loading: false });
    } catch (error) {
      console.error('Error fetching sessions:', error);
      set({ error: 'Не удалось загрузить сессии', loading: false });
    }
  },
  
  fetchCharacters: async () => {
    try {
      set({ loading: true });
      const user = auth.currentUser;
      
      if (!user) {
        set({ loading: false });
        return;
      }
      
      // Получаем персонажей пользователя
      const charactersQuery = query(collection(db, 'characters'), where('userId', '==', user.uid));
      const charactersSnapshot = await getDocs(charactersQuery);
      
      const charactersData = charactersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      set({ characters: charactersData, loading: false });
    } catch (error) {
      console.error('Error fetching characters:', error);
      set({ error: 'Не удалось загрузить персонажей', loading: false });
    }
  },
  
  createSession: async (name, description) => {
    try {
      set({ loading: true });
      const user = auth.currentUser;
      
      if (!user) {
        set({ loading: false, error: 'Вы не авторизованы' });
        return null;
      }
      
      // Генерируем код сессии
      const sessionCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Создаем новую сессию
      const sessionData = {
        name,
        description,
        code: sessionCode,
        creatorId: user.uid,
        creatorName: user.displayName || 'DM',
        createdAt: serverTimestamp(),
        users: [{
          id: user.uid,
          name: user.displayName || 'DM',
          isDM: true
        }]
      };
      
      const sessionRef = await addDoc(collection(db, 'sessions'), sessionData);
      
      const newSession = {
        id: sessionRef.id,
        ...sessionData
      };
      
      set(state => ({ 
        sessions: [...state.sessions, newSession],
        currentSession: newSession,
        loading: false 
      }));
      
      return newSession;
    } catch (error) {
      console.error('Error creating session:', error);
      set({ error: 'Не удалось создать сессию', loading: false });
      return null;
    }
  },
  
  joinSession: async (sessionCode, playerName, character) => {
    try {
      set({ loading: true });
      
      // Ищем сессию по коду
      const sessionsQuery = query(collection(db, 'sessions'), where('code', '==', sessionCode.toUpperCase()));
      const sessionsSnapshot = await getDocs(sessionsQuery);
      
      if (sessionsSnapshot.empty) {
        set({ error: 'Сессия не найдена', loading: false });
        return false;
      }
      
      const sessionDoc = sessionsSnapshot.docs[0];
      const sessionData = sessionDoc.data() as { users?: User[], [key: string]: any };
      
      // Определяем ID игрока (авторизованный или временный)
      const user = auth.currentUser;
      const playerId = user ? user.uid : `guest-${Math.random().toString(36).substring(2, 9)}`;
      
      // Проверяем, не присоединился ли уже игрок к сессии
      const users = sessionData.users || [];
      const existingUserIndex = users.findIndex((u) => u.id === playerId);
      
      if (existingUserIndex === -1) {
        // Добавляем игрока к сессии
        const updatedUsers = [
          ...users,
          {
            id: playerId,
            name: playerName,
            isDM: false,
            character: character || null
          }
        ];
        
        // Обновляем данные сессии
        await updateDoc(doc(db, 'sessions', sessionDoc.id), {
          users: updatedUsers
        });
      }
      
      // Устанавливаем текущую сессию
      set({ 
        currentSession: { id: sessionDoc.id, ...sessionData },
        loading: false 
      });
      
      return true;
    } catch (error) {
      console.error('Error joining session:', error);
      set({ error: 'Не удалось присоединиться к сессии', loading: false });
      return false;
    }
  },
  
  updateUserTheme: async (userId, theme) => {
    try {
      // Получаем документ пользователя
      const userRef = doc(db, 'users', userId);
      
      // Обновляем поле тема
      await updateDoc(userRef, {
        themePreference: theme,
        lastUpdated: serverTimestamp()
      });
      
      console.log(`Тема пользователя ${userId} обновлена на ${theme}`);
    } catch (error) {
      console.error('Error updating user theme:', error);
      // Ошибка в обновлении темы не должна прерывать работу приложения
    }
  },
  
  deleteCharacter: async (characterId) => {
    try {
      set({ loading: true });
      const user = auth.currentUser;
      
      if (!user) {
        set({ error: 'Вы не авторизованы', loading: false });
        return false;
      }
      
      // Удаляем персонажа из Firestore
      await deleteDoc(doc(db, 'characters', characterId));
      
      // Обновляем локальный список персонажей
      set(state => ({
        characters: state.characters.filter(char => char.id !== characterId),
        loading: false
      }));
      
      return true;
    } catch (error) {
      console.error('Error deleting character:', error);
      set({ error: 'Не удалось удалить персонажа', loading: false });
      return false;
    }
  },
  
  clearAllCharacters: async () => {
    try {
      set({ loading: true });
      const user = auth.currentUser;
      
      if (!user) {
        set({ error: 'Вы не авторизованы', loading: false });
        return false;
      }
      
      // Получаем все персонажи пользователя
      const charactersQuery = query(collection(db, 'characters'), where('userId', '==', user.uid));
      const charactersSnapshot = await getDocs(charactersQuery);
      
      // Удаляем каждого персонажа
      const deletePromises = charactersSnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      
      await Promise.all(deletePromises);
      
      // Очищаем локальный список персонажей
      set({ characters: [], loading: false });
      
      return true;
    } catch (error) {
      console.error('Error clearing characters:', error);
      set({ error: 'Не удалось удалить всех персонажей', loading: false });
      return false;
    }
  },
  
  endSession: async (sessionId) => {
    try {
      set({ loading: true });
      const user = auth.currentUser;
      
      if (!user) {
        set({ error: 'Вы не авторизованы', loading: false });
        return false;
      }
      
      // Удаляем сессию из Firestore
      await deleteDoc(doc(db, 'sessions', sessionId));
      
      // Обновляем локальный список сессий
      set(state => ({
        sessions: state.sessions.filter(s => s.id !== sessionId),
        currentSession: state.currentSession?.id === sessionId ? null : state.currentSession,
        loading: false
      }));
      
      return true;
    } catch (error) {
      console.error('Error ending session:', error);
      set({ error: 'Не удалось завершить сессию', loading: false });
      return false;
    }
  }
}));
