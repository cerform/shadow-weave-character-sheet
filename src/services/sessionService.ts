
import { v4 as uuidv4 } from 'uuid';
import { db, auth } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import { Session, User, Character as SessionCharacter } from '../types/session';
import axios from 'axios';

// Сервис для работы с сессиями
const sessionService = {
  // Создание сессии
  createSession: async (name: string, description?: string): Promise<Session> => {
    const sessionId = uuidv4();
    const sessionCode = Math.random().toString(36).substring(2, 7).toUpperCase();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error("Пользователь не авторизован");
    }
    
    const session: Session = {
      id: sessionId,
      name: name,
      code: sessionCode,
      description: description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      users: [],
      isEnded: false
    };
    
    // Добавление сессии в Firestore
    await setDoc(doc(db, "sessions", sessionId), session);
    
    return session;
  },
  
  // Получение сессии по ID
  getSessionById: async (sessionId: string): Promise<Session | null> => {
    const docRef = doc(db, "sessions", sessionId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as Session;
    } else {
      return null;
    }
  },
  
  // Получение сессии по коду
  getSessionByCode: async (code: string): Promise<Session | null> => {
    const sessionsRef = collection(db, "sessions");
    const q = query(sessionsRef, where("code", "==", code));
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      // Предполагаем, что код уникален, поэтому берем первый результат
      const doc = querySnapshot.docs[0];
      return doc.data() as Session;
    } else {
      return null;
    }
  },
  
  // Получение всех сессий пользователя
  getUserSessions: async (): Promise<Session[]> => {
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error("Пользователь не авторизован");
    }
    
    const sessionsRef = collection(db, "sessions");
    const q = query(sessionsRef, where("createdBy", "==", user.uid));
    
    const querySnapshot = await getDocs(q);
    
    const sessions: Session[] = [];
    querySnapshot.forEach((doc) => {
      sessions.push(doc.data() as Session);
    });
    
    return sessions;
  },
  
  // Присоединение к сессии
  joinSession: async (sessionId: string, user: User): Promise<boolean> => {
    const sessionRef = doc(db, "sessions", sessionId);
    
    try {
      await updateDoc(sessionRef, {
        users: arrayUnion(user)
      });
      return true;
    } catch (error) {
      console.error("Ошибка при присоединении к сессии:", error);
      return false;
    }
  },
  
  // Выход из сессии
  leaveSession: async (sessionId: string, userId: string): Promise<boolean> => {
    const sessionRef = doc(db, "sessions", sessionId);
    
    try {
      // Получаем текущую сессию
      const sessionSnap = await getDoc(sessionRef);
      if (!sessionSnap.exists()) {
        throw new Error("Сессия не найдена");
      }
      
      const session = sessionSnap.data() as Session;
      
      // Фильтруем пользователей, исключая покидающего
      const updatedUsers = session.users?.filter(user => user.id !== userId) || [];
      
      // Обновляем сессию
      await updateDoc(sessionRef, {
        users: updatedUsers
      });
      
      return true;
    } catch (error) {
      console.error("Ошибка при выходе из сессии:", error);
      return false;
    }
  },
  
  // Завершение сессии
  deleteSession: async (sessionId: string): Promise<boolean> => {
    try {
      await deleteDoc(doc(db, "sessions", sessionId));
      return true;
    } catch (error) {
      console.error("Ошибка при завершении сессии:", error);
      return false;
    }
  },
  
  // Обновление кода сессии
  updateSessionCode: async (sessionId: string): Promise<string | false> => {
    try {
      const newCode = Math.random().toString(36).substring(2, 7).toUpperCase();
      const sessionRef = doc(db, "sessions", sessionId);
      
      await updateDoc(sessionRef, {
        code: newCode
      });
      
      return newCode;
    } catch (error) {
      console.error("Ошибка при обновлении кода сессии:", error);
      return false;
    }
  },
  
  // Сохранение заметок сессии
  saveSessionNotes: async (sessionId: string, notes: string): Promise<boolean> => {
    try {
      const sessionRef = doc(db, "sessions", sessionId);
      
      await updateDoc(sessionRef, {
        notes: notes
      });
      
      return true;
    } catch (error) {
      console.error("Ошибка при сохранении заметок:", error);
      return false;
    }
  }
};

// Сервис для работы с персонажами
const characterService = {
  // Сохранение персонажа
  saveCharacter: async (character: any): Promise<{ id: string } | false> => {
    try {
      const characterId = character.id || uuidv4();
      
      // Добавление или обновление персонажа в Firestore
      await setDoc(doc(db, "characters", characterId), character, { merge: true });
      
      return { id: characterId };
    } catch (error) {
      console.error("Ошибка при сохранении персонажа:", error);
      return false;
    }
  },
  
  // Получение персонажа по ID
  getCharacterById: async (characterId: string): Promise<any | null> => {
    const docRef = doc(db, "characters", characterId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  },
  
  // Получение всех персонажей пользователя
  getCharactersByUserId: async (): Promise<any[]> => {
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error("Пользователь не авторизован");
    }
    
    const charactersRef = collection(db, "characters");
    const q = query(charactersRef, where("userId", "==", user.uid));
    
    const querySnapshot = await getDocs(q);
    
    const characters: any[] = [];
    querySnapshot.forEach((doc) => {
      characters.push(doc.data());
    });
    
    return characters;
  },
  
  // Удаление персонажа
  deleteCharacter: async (characterId: string): Promise<boolean | void> => {
    try {
      await deleteDoc(doc(db, "characters", characterId));
      return true;
    } catch (error) {
      console.error("Ошибка при удалении персонажа:", error);
      return false;
    }
  }
};

// Temporary mock for firebase functions that are causing issues
const mockFirebaseUpload = async (file: File): Promise<string> => {
  console.log('File upload functionality not implemented yet');
  return URL.createObjectURL(file);
};

const mockFirebaseDelete = async (path: string): Promise<void> => {
  console.log('File deletion functionality not implemented yet:', path);
};

export const uploadImage = async (file: File): Promise<string> => {
  try {
    // Mock implementation
    const downloadUrl = await mockFirebaseUpload(file);
    return downloadUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const deleteImage = async (imageUrl: string): Promise<void> => {
  try {
    // Mock implementation
    await mockFirebaseDelete(imageUrl);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

export { sessionService, characterService };
