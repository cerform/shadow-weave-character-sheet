
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
import { 
  ref as storageRef, 
  uploadString, 
  getDownloadURL, 
  deleteObject, 
  listAll
} from "firebase/storage";
import { auth, db, storage } from "./firebase";
import { Session, User, Character, CharacterStorage } from "@/types/session";
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
        lastActivity: new Date().toISOString() // Конвертируем Timestamp в строку
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
      
      const data = docSnap.data();
      
      return {
        ...data,
        id: docSnap.id,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        lastActivity: data.lastActivity?.toDate?.()?.toISOString() || new Date().toISOString()
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
      const data = doc.data();
      
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        lastActivity: data.lastActivity?.toDate?.()?.toISOString() || new Date().toISOString()
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

// Сервис для работы с персонажами в Firebase Storage
export const characterService = {
  // Получить всех персонажей пользователя из Firebase Storage
  getCharacters: async (): Promise<Character[]> => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.warn("Пользователь не авторизован, возвращаем локальные данные");
        // Временно используем локальное хранилище, если пользователь не авторизован
        const storedData = localStorage.getItem('dnd-characters');
        if (!storedData) return [];
        
        const data = JSON.parse(storedData) as CharacterStorage;
        return data.characters || [];
      }
      
      // Путь для хранения персонажей в Storage
      const charactersRef = storageRef(storage, `characters/${currentUser.uid}`);
      
      try {
        // Получаем список всех файлов в директории
        const listResult = await listAll(charactersRef);
        
        // Асинхронно загружаем данные каждого персонажа
        const charactersPromises = listResult.items.map(async (item) => {
          const url = await getDownloadURL(item);
          const response = await fetch(url);
          const text = await response.text();
          return JSON.parse(text) as Character;
        });
        
        const characters = await Promise.all(charactersPromises);
        
        // Также сохраняем в localStorage для оффлайн-доступа
        localStorage.setItem('dnd-characters', JSON.stringify({ 
          characters,
          lastUsed: characters.length > 0 ? characters[0].id : undefined
        }));
        
        return characters;
      } catch (error) {
        if ((error as any)?.code === 'storage/object-not-found') {
          // Директория не существует, это нормально для новых пользователей
          return [];
        }
        throw error;
      }
    } catch (error) {
      console.error("Ошибка при получении персонажей:", error);
      // Пробуем использовать локальное хранилище при ошибке
      const storedData = localStorage.getItem('dnd-characters');
      if (!storedData) return [];
      
      const data = JSON.parse(storedData) as CharacterStorage;
      return data.characters || [];
    }
  },
  
  // Сохранить персонажа в Firebase Storage
  saveCharacter: async (character: Character): Promise<boolean> => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.warn("Пользователь не авторизован, сохраняем локально");
        // Временно сохраняем в локальное хранилище
        const storedData = localStorage.getItem('dnd-characters');
        const data: CharacterStorage = storedData ? JSON.parse(storedData) : { characters: [] };
        
        const existingCharIndex = data.characters.findIndex(c => c.id === character.id);
        
        if (existingCharIndex >= 0) {
          data.characters[existingCharIndex] = character;
        } else {
          data.characters.push(character);
        }
        
        data.lastUsed = character.id;
        localStorage.setItem('dnd-characters', JSON.stringify(data));
        return true;
      }
      
      // Путь для сохранения персонажа в Storage
      const characterRef = storageRef(storage, `characters/${currentUser.uid}/${character.id}.json`);
      
      // Сериализуем объект персонажа в строку JSON
      const characterJson = JSON.stringify(character);
      
      // Загружаем в Firebase Storage
      await uploadString(characterRef, characterJson);
      
      // Также сохраняем в localStorage для быстрого доступа
      const storedData = localStorage.getItem('dnd-characters');
      const data: CharacterStorage = storedData ? JSON.parse(storedData) : { characters: [] };
      
      const existingCharIndex = data.characters.findIndex(c => c.id === character.id);
      
      if (existingCharIndex >= 0) {
        data.characters[existingCharIndex] = character;
      } else {
        data.characters.push(character);
      }
      
      data.lastUsed = character.id;
      localStorage.setItem('dnd-characters', JSON.stringify(data));
      
      return true;
    } catch (error) {
      console.error("Ошибка при сохранении персонажа:", error);
      toast.error("Не удалось сохранить персонажа");
      return false;
    }
  },
  
  // Удалить персонажа
  deleteCharacter: async (characterId: string): Promise<boolean> => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.warn("Пользователь не авторизован, удаляем из локального хранилища");
        // Удаляем из локального хранилища
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
      }
      
      // Путь к персонажу в Storage
      const characterRef = storageRef(storage, `characters/${currentUser.uid}/${characterId}.json`);
      
      // Удаляем персонажа из Firebase Storage
      await deleteObject(characterRef);
      
      // Также обновляем локальное хранилище
      const storedData = localStorage.getItem('dnd-characters');
      if (storedData) {
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
      }
      
      return true;
    } catch (error) {
      console.error("Ошибка при удалении персонажа:", error);
      // Если ошибка "объект не найден", считаем что персонаж успешно удален
      if ((error as any)?.code === 'storage/object-not-found') {
        return true;
      }
      
      toast.error("Не удалось удалить персонажа");
      return false;
    }
  },
  
  // Очистить всех персонажей
  clearAllCharacters: async (): Promise<boolean> => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.warn("Пользователь не авторизован, очищаем локальное хранилище");
        // Очищаем локальное хранилище
        localStorage.setItem('dnd-characters', JSON.stringify({
          characters: [],
          lastUsed: undefined
        }));
        
        return true;
      }
      
      // Путь для хранения персонажей в Storage
      const charactersRef = storageRef(storage, `characters/${currentUser.uid}`);
      
      // Получаем список всех файлов в директории
      const listResult = await listAll(charactersRef);
      
      // Удаляем каждый файл по очереди
      const deletePromises = listResult.items.map(item => deleteObject(item));
      await Promise.all(deletePromises);
      
      // Также очищаем локальное хранилище
      localStorage.setItem('dnd-characters', JSON.stringify({
        characters: [],
        lastUsed: undefined
      }));
      
      return true;
    } catch (error) {
      console.error("Ошибка при удалении всех персонажей:", error);
      // Если ошибка "объект не найден", считаем что персонажи успешно удалены
      if ((error as any)?.code === 'storage/object-not-found') {
        return true;
      }
      
      toast.error("Не удалось удалить персонажей");
      return false;
    }
  }
};
