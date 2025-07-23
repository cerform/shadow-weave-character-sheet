import { ref, set, get } from 'firebase/database';
import { db } from '@/lib/firebase';
import { getCurrentUid } from '@/utils/authHelpers';

// Сервис для работы с пользователями в Realtime Database
export const createUserProfile = async (userData: any): Promise<void> => {
  const uid = getCurrentUid();
  if (!uid) throw new Error('Пользователь не авторизован');

  const userRef = ref(db, `users/${uid}`);
  await set(userRef, {
    ...userData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
};

export const getUserProfile = async (userId?: string): Promise<any | null> => {
  const uid = userId || getCurrentUid();
  if (!uid) return null;

  const userRef = ref(db, `users/${uid}`);
  const snapshot = await get(userRef);
  
  return snapshot.exists() ? snapshot.val() : null;
};

export const updateUserProfile = async (userData: any): Promise<void> => {
  const uid = getCurrentUid();
  if (!uid) throw new Error('Пользователь не авторизован');

  const userRef = ref(db, `users/${uid}`);
  await set(userRef, {
    ...userData,
    updatedAt: new Date().toISOString()
  });
};