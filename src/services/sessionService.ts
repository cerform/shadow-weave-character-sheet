
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  updateDoc, 
  query, 
  where, 
  serverTimestamp, 
  Timestamp, 
  addDoc
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { Session, User, Character } from "@/types/session";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

// Генерирует случайный код сессии (6 символов, A-Z0-9)
const generateSessionCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Сервис для работы с сессиями в Firebase
export const sessionService = {
  // Получить все сессии текущего мастера
  getUserSessions: async (): Promise<Session[]> => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Пользователь не авторизован");

      const q = query(collection(db, "sessions"), where("dmId", "==", currentUser.uid));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      })) as Session[];
    } catch (error) {
      console.error("Ошибка при получении сессий:", error);
      toast.error("Не удалось загрузить сессии");
      return [];
    }
  },
  
  // Создать новую сессию
  createSession: async (name: string, description?: string): Promise<Session | null> => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Пользователь не авторизован");
      
      const code = generateSessionCode();
      const dmUser: User = {
        id: currentUser.uid,
        name: currentUser.displayName || 'Мастер',
        themePreference: 'dark',
        isOnline: true,
        isDM: true
      };
      
      const sessionData = {
        title: name,
        name: name,
        description: description || "",
        dmId: currentUser.uid,
        players: [],
        users: [dmUser],
        startTime: new Date().toISOString(),
        isActive: true,
        notes: [],
        code: code,
        createdAt: Timestamp.now(),
        lastActivity: Timestamp.now()
      };
      
      const docRef = await addDoc(collection(db, "sessions"), sessionData);
      
      return {
        ...sessionData,
        id: docRef.id,
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Ошибка при создании сессии:", error);
      toast.error("Не удалось создать сессию");
      return null;
    }
  },
  
  // Получить сессию по ID
  getSessionById: async (sessionId: string): Promise<Session | null> => {
    try {
      const docRef = doc(db, "sessions", sessionId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) return null;
      
      return {
        ...docSnap.data(),
        id: docSnap.id,
        createdAt: docSnap.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      } as Session;
    } catch (error) {
      console.error("Ошибка при получении сессии:", error);
      toast.error("Не удалось загрузить сессию");
      return null;
    }
  },
  
  // Получить сессию по коду
  getSessionByCode: async (code: string): Promise<Session | null> => {
    try {
      const q = query(collection(db, "sessions"), where("code", "==", code));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) return null;
      
      const doc = querySnapshot.docs[0];
      return {
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      } as Session;
    } catch (error) {
      console.error("Ошибка при получении сессии по коду:", error);
      toast.error("Не удалось найти сессию по коду");
      return null;
    }
  },
  
  // Присоединиться к сессии
  joinSession: async (sessionId: string, user: User): Promise<boolean> => {
    try {
      const sessionRef = doc(db, "sessions", sessionId);
      const sessionSnap = await getDoc(sessionRef);
      
      if (!sessionSnap.exists()) {
        toast.error("Сессия не найдена");
        return false;
      }
      
      const sessionData = sessionSnap.data();
      const users = sessionData.users || [];
      
      // Проверяем, есть ли пользователь уже в сессии
      const existingUserIndex = users.findIndex((u: any) => u.id === user.id);
      
      if (existingUserIndex >= 0) {
        // Обновляем данные пользователя
        users[existingUserIndex] = {
          ...users[existingUserIndex],
          ...user,
          isOnline: true
        };
      } else {
        // Добавляем нового пользователя
        users.push({
          ...user,
          isOnline: true
        });
      }
      
      await updateDoc(sessionRef, {
        users,
        lastActivity: Timestamp.now()
      });
      
      return true;
    } catch (error) {
      console.error("Ошибка при присоединении к сессии:", error);
      toast.error("Не удалось присоединиться к сессии");
      return false;
    }
  },
  
  // Обновить код сессии
  updateSessionCode: async (sessionId: string): Promise<string | null> => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Пользователь не авторизован");
      
      const sessionRef = doc(db, "sessions", sessionId);
      const sessionSnap = await getDoc(sessionRef);
      
      if (!sessionSnap.exists()) {
        toast.error("Сессия не найдена");
        return null;
      }
      
      // Проверяем права доступа
      if (sessionSnap.data().dmId !== currentUser.uid) {
        toast.error("У вас нет прав на обновление кода этой сессии");
        return null;
      }
      
      const newCode = generateSessionCode();
      
      await updateDoc(sessionRef, {
        code: newCode,
        lastActivity: Timestamp.now()
      });
      
      return newCode;
    } catch (error) {
      console.error("Ошибка при обновлении кода сессии:", error);
      toast.error("Не удалось обновить код сессии");
      return null;
    }
  },
  
  // Сохранить заметки сессии
  saveSessionNotes: async (sessionId: string, notes: string): Promise<boolean> => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Пользователь не авторизован");
      
      const sessionRef = doc(db, "sessions", sessionId);
      const sessionSnap = await getDoc(sessionRef);
      
      if (!sessionSnap.exists()) {
        toast.error("Сессия не найдена");
        return false;
      }
      
      // Проверяем права доступа
      if (sessionSnap.data().dmId !== currentUser.uid) {
        toast.error("У вас нет прав на редактирование этой сессии");
        return false;
      }
      
      const noteEntry = {
        id: uuidv4(),
        content: notes,
        timestamp: new Date().toISOString(),
        authorId: currentUser.uid
      };
      
      const existingNotes = sessionSnap.data().notes || [];
      
      await updateDoc(sessionRef, {
        notes: [...existingNotes, noteEntry],
        lastActivity: Timestamp.now()
      });
      
      return true;
    } catch (error) {
      console.error("Ошибка при сохранении заметок:", error);
      toast.error("Не удалось сохранить заметки");
      return false;
    }
  },
  
  // Удалить сессию
  deleteSession: async (sessionId: string): Promise<boolean> => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Пользователь не авторизован");
      
      const sessionRef = doc(db, "sessions", sessionId);
      const sessionSnap = await getDoc(sessionRef);
      
      if (!sessionSnap.exists()) {
        toast.error("Сессия не найдена");
        return false;
      }
      
      // Проверяем права доступа
      if (sessionSnap.data().dmId !== currentUser.uid) {
        toast.error("У вас нет прав на удаление этой сессии");
        return false;
      }
      
      await deleteDoc(sessionRef);
      toast.success("Сессия успешно удалена");
      return true;
    } catch (error) {
      console.error("Ошибка при удалении сессии:", error);
      toast.error("Не удалось удалить сессию");
      return false;
    }
  }
};

// Сервис для работы с персонажами
export const characterService = {
  // Получить всех персонажей пользователя из локального хранилища
  getCharacters: (): Character[] => {
    try {
      const storedData = localStorage.getItem('dnd-characters');
      if (!storedData) return [];
      
      const data = JSON.parse(storedData) as CharacterStorage;
      return data.characters || [];
    } catch (error) {
      console.error("Ошибка при получении персонажей:", error);
      return [];
    }
  },
  
  // Удалить персонажа
  deleteCharacter: (characterId: string): boolean => {
    try {
      const storedData = localStorage.getItem('dnd-characters');
      if (!storedData) return false;
      
      const data = JSON.parse(storedData) as CharacterStorage;
      
      const updatedCharacters = data.characters.filter(c => c.id !== characterId);
      
      // Если удаляем последнего использованного персонажа, сбрасываем lastUsed
      let lastUsed = data.lastUsed;
      if (lastUsed === characterId) {
        lastUsed = updatedCharacters.length > 0 ? updatedCharacters[0].id : undefined;
      }
      
      localStorage.setItem('dnd-characters', JSON.stringify({
        characters: updatedCharacters,
        lastUsed
      }));
      
      return true;
    } catch (error) {
      console.error("Ошибка при удалении персонажа:", error);
      return false;
    }
  },
  
  // Очистить всех персонажей
  clearAllCharacters: (): boolean => {
    try {
      localStorage.setItem('dnd-characters', JSON.stringify({
        characters: [],
        lastUsed: undefined
      }));
      
      return true;
    } catch (error) {
      console.error("Ошибка при удалении всех персонажей:", error);
      return false;
    }
  }
};
