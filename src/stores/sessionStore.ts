
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
      const sessionData = { id: sessionDoc.id, ...sessionDoc.data() };
      
      // Определяем ID игрока (авторизованный или временный)
      const user = auth.currentUser;
      const playerId = user ? user.uid : `guest-${Math.random().toString(36).substring(2, 9)}`;
      
      // Проверяем, не присоединился ли уже игрок к сессии
      const existingUserIndex = sessionData.users?.findIndex((u: any) => u.id === playerId);
      
      if (existingUserIndex === -1) {
        // Добавляем игрока к сессии
        const updatedUsers = [
          ...(sessionData.users || []),
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
  }
}));
