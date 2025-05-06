
import { getFirestore, collection, addDoc, query, where, getDocs, updateDoc, doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from './firebase/firestore';

export interface Participant {
  userId: string;
  characterId: string;
  characterName: string;
  joinedAt: Date;
}

export interface Session {
  id: string;
  sessionKey: string;
  name: string;
  hostId: string;
  createdAt: Date;
  participants: Participant[];
}

/** Создать новую сессию */
export async function createSession(name: string, hostId: string): Promise<Session> {
  // Генерируем шестизначный код для сессии
  const sessionKey = (Math.random()*1e6|0).toString().padStart(6,'0');
  
  const docRef = await addDoc(collection(db, 'sessions'), {
    name,
    hostId,
    sessionKey,
    createdAt: new Date(),
    participants: []
  });
  
  return { 
    id: docRef.id, 
    sessionKey, 
    name, 
    hostId, 
    createdAt: new Date(), 
    participants: [] 
  };
}

/** Найти сессию по ключу */
export async function getSessionByKey(key: string): Promise<Session|null> {
  const q = query(collection(db, 'sessions'), where('sessionKey', '==', key));
  const snap = await getDocs(q);
  
  if (snap.empty) return null;
  
  const docSnap = snap.docs[0];
  const data = docSnap.data();
  
  return {
    id: docSnap.id,
    sessionKey: data.sessionKey,
    name: data.name,
    hostId: data.hostId,
    createdAt: data.createdAt.toDate(),
    participants: data.participants ? data.participants.map((p: any) => ({
      ...p,
      joinedAt: p.joinedAt.toDate()
    })) : []
  };
}

/** Получить сессию по ID */
export async function getSessionById(sessionId: string): Promise<Session|null> {
  try {
    const sessionRef = doc(db, 'sessions', sessionId);
    const docSnap = await getDoc(sessionRef);
    
    if (!docSnap.exists()) return null;
    
    const data = docSnap.data();
    
    return {
      id: docSnap.id,
      sessionKey: data.sessionKey,
      name: data.name,
      hostId: data.hostId,
      createdAt: data.createdAt.toDate(),
      participants: data.participants ? data.participants.map((p: any) => ({
        ...p,
        joinedAt: p.joinedAt.toDate()
      })) : []
    };
  } catch (error) {
    console.error("Ошибка при получении сессии:", error);
    return null;
  }
}

/** Добавить участника (сам игрок вызывает после выбора персонажа) */
export async function addParticipant(
  sessionId: string,
  userId: string,
  characterId: string,
  characterName: string
): Promise<void> {
  const sessionRef = doc(db, 'sessions', sessionId);
  const docSnap = await getDoc(sessionRef);
  
  if (!docSnap.exists()) {
    throw new Error("Сессия не найдена");
  }
  
  const data = docSnap.data();
  const participants = data.participants || [];
  
  // Проверяем, не присоединился ли уже этот пользователь
  const existingIndex = participants.findIndex((p: any) => p.userId === userId);
  
  if (existingIndex >= 0) {
    // Обновляем существующего участника
    participants[existingIndex] = { 
      userId, 
      characterId, 
      characterName, 
      joinedAt: new Date() 
    };
  } else {
    // Добавляем нового участника
    participants.push({ 
      userId, 
      characterId, 
      characterName, 
      joinedAt: new Date() 
    });
  }
  
  await updateDoc(sessionRef, { participants });
}

/** Удалить участника из сессии */
export async function removeParticipant(sessionId: string, userId: string): Promise<void> {
  const sessionRef = doc(db, 'sessions', sessionId);
  const docSnap = await getDoc(sessionRef);
  
  if (!docSnap.exists()) {
    throw new Error("Сессия не найдена");
  }
  
  const data = docSnap.data();
  const participants = data.participants || [];
  
  const filtered = participants.filter((p: any) => p.userId !== userId);
  
  await updateDoc(sessionRef, { participants: filtered });
}

/** Реальное-время: подписка на изменения сессии */
export function subscribeToSession(
  sessionId: string,
  onChange: (session: Session) => void
): () => void {
  const sessionRef = doc(db, 'sessions', sessionId);
  
  return onSnapshot(sessionRef, snap => {
    if (!snap.exists()) {
      console.error("Сессия не существует:", sessionId);
      return;
    }
    
    const d = snap.data();
    onChange({
      id: snap.id,
      sessionKey: d.sessionKey,
      name: d.name,
      hostId: d.hostId,
      createdAt: d.createdAt.toDate(),
      participants: d.participants ? d.participants.map((p: any) => ({ 
        ...p, 
        joinedAt: p.joinedAt.toDate() 
      })) : []
    });
  });
}

/** Получить список сессий, созданных пользователем */
export async function getSessionsByHostId(hostId: string): Promise<Session[]> {
  const q = query(collection(db, 'sessions'), where('hostId', '==', hostId));
  const snap = await getDocs(q);
  
  return snap.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      sessionKey: data.sessionKey,
      name: data.name,
      hostId: data.hostId,
      createdAt: data.createdAt.toDate(),
      participants: data.participants ? data.participants.map((p: any) => ({
        ...p,
        joinedAt: p.joinedAt.toDate()
      })) : []
    };
  });
}

/** Удалить сессию */
export async function deleteSession(sessionId: string): Promise<void> {
  await deleteDoc(doc(db, 'sessions', sessionId));
}

import { deleteDoc } from 'firebase/firestore';
