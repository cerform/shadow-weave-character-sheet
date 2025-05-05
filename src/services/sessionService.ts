import { auth, db, storage } from './firebase';
import { collection, doc, getDoc, getDocs, query, where, addDoc, deleteDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Session, User as SessionUser } from '../types/session';
import { v4 as uuidv4 } from 'uuid';
import { Character } from '@/utils/characterImports';
import characterService from './characterService';

// Экспортируем сервис персонажей
export { characterService };

// Сервис для работы с сессиями
export const sessionService = {
  // Создание новой сессии
  createSession: async (name: string, description?: string): Promise<Session | null> => {
    const uid = getCurrentUid();
    if (!uid) return null;
    
    try {
      // Генерируем уникальный ID и код для сессии
      const sessionId = uuidv4();
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Создаем объект сессии
      const session: Session = {
        id: sessionId,
        title: name,
        description: description || '',
        code,
        dmId: uid,
        players: [],
        users: [],
        createdAt: new Date().toISOString(),
        startTime: new Date().toISOString(),
        isActive: true,
        notes: []
      };
      
      // Сохраняем сессию в Firestore
      const sessionRef = doc(db, 'sessions', sessionId);
      await setDoc(sessionRef, {
        ...session,
        lastActivity: serverTimestamp()
      });
      
      // Добавляем сессию в список у пользователя
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const campaigns = userData.campaigns || [];
        
        await updateDoc(userRef, {
          campaigns: [...campaigns, sessionId]
        });
      }
      
      return session;
    } catch (error) {
      console.error("Ошибка при создании сессии:", error);
      return null;
    }
  },
  
  // Получение сессий пользователя
  getUserSessions: async (): Promise<Session[]> => {
    const uid = getCurrentUid();
    if (!uid) return [];
    
    try {
      // Получаем сессии, где пользователь - мастер
      const sessionsRef = collection(db, 'sessions');
      const q = query(sessionsRef, where('dmId', '==', uid));
      const querySnapshot = await getDocs(q);
      
      const sessions: Session[] = [];
      querySnapshot.forEach((doc) => {
        sessions.push({ id: doc.id, ...doc.data() } as Session);
      });
      
      // TODO: получение сессий, где пользователь - игрок
      
      return sessions;
    } catch (error) {
      console.error("Ошибка при получении сессий:", error);
      return [];
    }
  },
  
  // Получение сессии по ID
  getSessionById: async (sessionId: string): Promise<Session | null> => {
    try {
      const sessionRef = doc(db, 'sessions', sessionId);
      const sessionSnap = await getDoc(sessionRef);
      
      if (sessionSnap.exists()) {
        return { id: sessionSnap.id, ...sessionSnap.data() } as Session;
      }
      
      return null;
    } catch (error) {
      console.error("Ошибка при получении сессии:", error);
      return null;
    }
  },
  
  // Получение сессии по коду
  getSessionByCode: async (code: string): Promise<Session | null> => {
    try {
      const sessionsRef = collection(db, 'sessions');
      const q = query(sessionsRef, where('code', '==', code));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Session;
      }
      
      return null;
    } catch (error) {
      console.error("Ошибка при получении сессии по коду:", error);
      return null;
    }
  },
  
  // Присоединение к сессии
  joinSession: async (sessionId: string, user: SessionUser): Promise<boolean> => {
    try {
      const sessionRef = doc(db, 'sessions', sessionId);
      const sessionSnap = await getDoc(sessionRef);
      
      if (!sessionSnap.exists()) {
        return false;
      }
      
      const sessionData = sessionSnap.data() as Session;
      const users = sessionData.users || [];
      
      // Проверяем, не присоединился ли уже пользователь
      const existingUserIndex = users.findIndex(u => u.id === user.id);
      
      if (existingUserIndex !== -1) {
        // Обновляем данные пользователя
        users[existingUserIndex] = { ...users[existingUserIndex], ...user };
      } else {
        // Добавляем нового пользователя
        users.push(user);
      }
      
      // Обновляем сессию
      await updateDoc(sessionRef, {
        users,
        updatedAt: new Date().toISOString()
      });
      
      return true;
    } catch (error) {
      console.error("Ошибка при присоединении к сессии:", error);
      return false;
    }
  },
  
  // Удаление сессии
  deleteSession: async (sessionId: string): Promise<boolean> => {
    const uid = getCurrentUid();
    if (!uid) return false;
    
    try {
      const sessionRef = doc(db, 'sessions', sessionId);
      const sessionSnap = await getDoc(sessionRef);
      
      if (!sessionSnap.exists()) {
        return false;
      }
      
      const sessionData = sessionSnap.data();
      
      // Проверяем, является ли текущий пользователь мастером
      if (sessionData.dmId !== uid) {
        console.error("Нет прав на удаление сессии");
        return false;
      }
      
      // Удаляем сессию
      await deleteDoc(sessionRef);
      
      // Удаляем сессию из списка у пользователя
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const campaigns = userData.campaigns || [];
        
        await updateDoc(userRef, {
          campaigns: campaigns.filter((id: string) => id !== sessionId)
        });
      }
      
      return true;
    } catch (error) {
      console.error("Ошибка при удалении сессии:", error);
      return false;
    }
  },
  
  // Добавляем новые методы, которые используются в DMSessionPage
  updateSessionCode: async (sessionId: string): Promise<string | null> => {
    const uid = getCurrentUid();
    if (!uid) return null;
    
    try {
      const sessionRef = doc(db, 'sessions', sessionId);
      const sessionSnap = await getDoc(sessionRef);
      
      if (!sessionSnap.exists()) {
        return null;
      }
      
      const sessionData = sessionSnap.data();
      
      // Проверяем, является ли текущий пользователь мастером
      if (sessionData.dmId !== uid) {
        console.error("Нет прав на обновление кода сессии");
        return null;
      }
      
      // Генерируем новый код
      const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Обновляем код в Firestore
      await updateDoc(sessionRef, {
        code: newCode,
        lastActivity: serverTimestamp()
      });
      
      return newCode;
    } catch (error) {
      console.error("Ошибка при обновлении кода сессии:", error);
      return null;
    }
  },
  
  saveSessionNotes: async (sessionId: string, content: string): Promise<boolean> => {
    const uid = getCurrentUid();
    if (!uid) return false;
    
    try {
      const sessionRef = doc(db, 'sessions', sessionId);
      const sessionSnap = await getDoc(sessionRef);
      
      if (!sessionSnap.exists()) {
        return false;
      }
      
      const sessionData = sessionSnap.data() as Session;
      
      // Проверяем, является ли текущий пользователь мастером
      if (sessionData.dmId !== uid) {
        console.error("Нет прав на сохранение заметок сессии");
        return false;
      }
      
      // Создаем новую заметку
      const newNote = {
        id: uuidv4(),
        content,
        timestamp: new Date().toISOString(),
        authorId: uid
      };
      
      // Добавляем заметку к существующим или создаем новый массив
      const notes = sessionData.notes || [];
      notes.push(newNote);
      
      // Обновляем заметки в Firestore
      await updateDoc(sessionRef, {
        notes,
        lastActivity: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error("Ошибка при сохранении заметок:", error);
      return false;
    }
  }
};

// Функции для работы с хранилищем Firebase
export const storageService = {
  // Загрузка изображения
  uploadImage: async (file: File, path: string): Promise<string | null> => {
    const uid = getCurrentUid();
    if (!uid) return null;
    
    try {
      const storageRef = ref(storage, `${path}/${uid}/${file.name}`);
      await uploadBytes(storageRef, file);
      
      const downloadUrl = await getDownloadURL(storageRef);
      return downloadUrl;
    } catch (error) {
      console.error("Ошибка при загрузке изображения:", error);
      return null;
    }
  },
  
  // Удаление изображения
  deleteImage: async (url: string): Promise<boolean> => {
    try {
      const imageRef = ref(storage, url);
      await deleteObject(imageRef);
      return true;
    } catch (error) {
      console.error("Ошибка при удалении изображения:", error);
      return false;
    }
  }
};

export default { characterService, sessionService, storageService };

// Helper function to get current user ID
const getCurrentUid = () => {
  return auth.currentUser?.uid;
};
