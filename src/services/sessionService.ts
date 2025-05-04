import { db, storage } from './firebase';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
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
const ref = (storage: any, path: string) => {
  return { fullPath: path };
};

const uploadBytes = async (reference: any, file: File) => {
  console.log('Mock uploadBytes called', reference, file);
  return { ref: reference };
};

const getDownloadURL = async (reference: any) => {
  console.log('Mock getDownloadURL called', reference);
  return `https://mock-url/${reference.fullPath}`;
};

const deleteObject = async (reference: any) => {
  console.log('Mock deleteObject called', reference);
  return true;
};

// Mock для недостающих методов
const updateSessionCode = async (sessionId: string, code: string) => {
  console.log('Mock updateSessionCode called', sessionId, code);
  return { success: true };
};

const saveSessionNotes = async (sessionId: string, notes: any) => {
  console.log('Mock saveSessionNotes called', sessionId, notes);
  return { success: true };
};

// Экспортируем объект с дополнительными методами
export default {
  createSession,
  getSession,
  getSessionsByDM,
  updateSession,
  deleteSession,
  updateSessionCode,
  saveSessionNotes
};
