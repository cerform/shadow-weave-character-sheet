
import { db, storage } from './firebase';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, Timestamp } from 'firebase/firestore';
import { ref as storageRef, uploadBytes as storageUploadBytes, getDownloadURL as storageGetDownloadURL, deleteObject as storageDeleteObject } from "firebase/storage";
import { Session } from '@/types/session';
import axios from 'axios';

const SESSIONS_COLLECTION = 'sessions';

const createSession = async (session: Omit<Session, 'id' | 'createdAt' | 'lastActivity'>, dmId: string): Promise<{ id: string }> => {
  try {
    const sessionsCollection = collection(db, SESSIONS_COLLECTION);
    const newSession = {
      ...session,
      dmId: dmId,
      players: [],
      createdAt: Timestamp.now(),
      lastActivity: Timestamp.now(),
      isEnded: false // добавляем поле isEnded для совместимости
    };
    const docRef = await addDoc(sessionsCollection, newSession);
    return { id: docRef.id };
  } catch (error) {
    console.error("Error creating session:", error);
    throw error;
  }
};

const getSession = async (id: string): Promise<Session | null> => {
  try {
    const sessionDoc = doc(db, SESSIONS_COLLECTION, id);
    const docSnap = await getDoc(sessionDoc);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Session;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching session:", error);
    return null;
  }
};

const getSessionsByDM = async (dmId: string): Promise<Session[]> => {
    try {
        const sessionsCollection = collection(db, SESSIONS_COLLECTION);
        const q = query(sessionsCollection, where("dmId", "==", dmId));
        const querySnapshot = await getDocs(q);
        const sessions: Session[] = [];
        querySnapshot.forEach((doc) => {
            sessions.push({ id: doc.id, ...doc.data() } as Session);
        });
        return sessions;
    } catch (error) {
        console.error("Error fetching sessions by DM:", error);
        return [];
    }
};

const updateSession = async (id: string, updates: Partial<Session>): Promise<void> => {
  try {
    const sessionDoc = doc(db, SESSIONS_COLLECTION, id);
    await updateDoc(sessionDoc, {
      ...updates,
      lastActivity: Timestamp.now()
    });
  } catch (error) {
    console.error("Error updating session:", error);
    throw error;
  }
};

const deleteSession = async (id: string): Promise<void> => {
  try {
    const sessionDoc = doc(db, SESSIONS_COLLECTION, id);
    await deleteDoc(sessionDoc);
  } catch (error) {
    console.error("Error deleting session:", error);
    throw error;
  }
};

// Mock функции Firebase Storage для совместимости
const mockFileRef = (storagePath: string) => {
  return { fullPath: storagePath };
};

const mockUploadBytes = async (reference: any, file: File) => {
  console.log('Mock uploadBytes called', reference, file);
  return { ref: reference };
};

const mockGetDownloadURL = async (reference: any) => {
  console.log('Mock getDownloadURL called', reference);
  return `https://mock-url/${reference.fullPath}`;
};

const mockDeleteObject = async (reference: any) => {
  console.log('Mock deleteObject called', reference);
  return true;
};

// Дополнительные методы для работы с сессиями
const updateSessionCode = async (sessionId: string, code?: string): Promise<string> => {
  try {
    // Создаем случайный код, если он не был передан
    const newCode = code || Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Обновляем сессию с новым кодом
    const sessionDoc = doc(db, SESSIONS_COLLECTION, sessionId);
    await updateDoc(sessionDoc, { 
      code: newCode,
      lastActivity: Timestamp.now()
    });
    
    return newCode;
  } catch (error) {
    console.error("Error updating session code:", error);
    throw error;
  }
};

const saveSessionNotes = async (sessionId: string, notesContent: string): Promise<boolean> => {
  try {
    const sessionDoc = doc(db, SESSIONS_COLLECTION, sessionId);
    const sessionData = await getDoc(sessionDoc);
    
    if (!sessionData.exists()) {
      return false;
    }
    
    const session = { id: sessionData.id, ...sessionData.data() } as Session;
    const notes = session.notes || [];
    
    // Добавляем новую заметку
    notes.push({
      id: Date.now().toString(),
      content: notesContent,
      timestamp: new Date().toISOString(),
      authorId: session.dmId // Предполагаем, что заметки может создавать только ДМ
    });
    
    // Обновляем сессию
    await updateDoc(sessionDoc, { 
      notes,
      lastActivity: Timestamp.now()
    });
    
    return true;
  } catch (error) {
    console.error("Error saving session notes:", error);
    return false;
  }
};

// Получение сессии по коду доступа
const getSessionByCode = async (code: string): Promise<Session | null> => {
  try {
    const sessionsCollection = collection(db, SESSIONS_COLLECTION);
    const q = query(sessionsCollection, where("code", "==", code));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const sessionDoc = querySnapshot.docs[0];
    return { id: sessionDoc.id, ...sessionDoc.data() } as Session;
  } catch (error) {
    console.error("Error fetching session by code:", error);
    return null;
  }
};

// Присоединение к сессии
const joinSession = async (sessionId: string, user: any): Promise<boolean> => {
  try {
    const sessionDoc = doc(db, SESSIONS_COLLECTION, sessionId);
    const sessionData = await getDoc(sessionDoc);
    
    if (!sessionData.exists()) {
      return false;
    }
    
    const session = { id: sessionData.id, ...sessionData.data() } as Session;
    const users = session.users || [];
    
    // Проверяем, не присоединился ли уже пользователь
    const existingUserIndex = users.findIndex(u => u.id === user.id);
    
    if (existingUserIndex >= 0) {
      // Обновляем информацию о существующем пользователе
      users[existingUserIndex] = { ...users[existingUserIndex], ...user, isOnline: true };
    } else {
      // Добавляем нового пользователя
      users.push({ ...user, isOnline: true });
    }
    
    // Обновляем сессию
    await updateDoc(sessionDoc, { 
      users,
      lastActivity: Timestamp.now()
    });
    
    return true;
  } catch (error) {
    console.error("Error joining session:", error);
    return false;
  }
};

// Выход из сессии
const leaveSession = async (sessionId: string, userId: string): Promise<boolean> => {
  try {
    const sessionDoc = doc(db, SESSIONS_COLLECTION, sessionId);
    const sessionData = await getDoc(sessionDoc);
    
    if (!sessionData.exists()) {
      return false;
    }
    
    const session = { id: sessionData.id, ...sessionData.data() } as Session;
    const users = session.users || [];
    
    // Находим пользователя
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex >= 0) {
      // Отмечаем пользователя как оффлайн
      users[userIndex] = { ...users[userIndex], isOnline: false };
      
      // Обновляем сессию
      await updateDoc(sessionDoc, { 
        users,
        lastActivity: Timestamp.now()
      });
    }
    
    return true;
  } catch (error) {
    console.error("Error leaving session:", error);
    return false;
  }
};

// Получение всех активных сессий пользователя
const getUserSessions = async (): Promise<Session[]> => {
  // Этот метод можно реализовать позже с учетом авторизации
  return [];
};

// Get session by ID - alias для getSession с более понятным именем
const getSessionById = getSession;

const sessionService = {
  createSession,
  getSession,
  getSessionById,
  getSessionByCode,
  getSessionsByDM,
  getUserSessions,
  updateSession,
  deleteSession,
  updateSessionCode,
  saveSessionNotes,
  joinSession,
  leaveSession
};

export default sessionService;
