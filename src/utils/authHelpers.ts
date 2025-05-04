
import { auth, db } from '@/services/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { FirestoreUserData } from '@/utils/firestoreHelpers';

/**
 * Получает UID текущего авторизованного пользователя
 * @returns UID пользователя или null если пользователь не авторизован
 */
export const getCurrentUid = (): string | null => {
  const currentUser = auth.currentUser;
  if (currentUser) {
    console.log("getCurrentUid: пользователь авторизован", currentUser.uid);
    return currentUser.uid;
  }
  console.log("getCurrentUid: пользователь не авторизован");
  return null;
};

/**
 * Проверяет, авторизован ли пользователь
 * @returns true если пользователь авторизован, иначе false
 */
export const isAuthenticated = (): boolean => {
  return !!auth.currentUser;
};

/**
 * Получает данные текущего авторизованного пользователя
 * @returns Объект с данными пользователя или null если пользователь не авторизован
 */
export const getCurrentUser = () => {
  const user = auth.currentUser;
  if (!user) return null;
  
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL
  };
};

/**
 * Проверяет, является ли пользователь анонимным
 * @returns true если пользователь анонимный, иначе false
 */
export const isAnonymous = (): boolean => {
  const user = auth.currentUser;
  return !!user?.isAnonymous;
};

/**
 * Проверяет, подтвержден ли email пользователя
 * @returns true если email подтвержден, иначе false
 */
export const isEmailVerified = (): boolean => {
  const user = auth.currentUser;
  return !!user?.emailVerified;
};

/**
 * Синхронизирует данные пользователя с Firestore
 * @param userData Данные пользователя для обновления
 * @returns Promise с результатом операции
 */
export const syncUserWithFirestore = async (userData: { 
  username?: string;
  email?: string;
  isDM?: boolean;
}) => {
  try {
    const uid = getCurrentUid();
    if (!uid) {
      console.error("syncUserWithFirestore: Пользователь не авторизован");
      return null;
    }

    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);

    const timestamp = new Date().toISOString();
    
    if (userDoc.exists()) {
      // Обновляем существующего пользователя
      console.log("syncUserWithFirestore: Обновляем пользователя", uid);
      await updateDoc(userRef, {
        ...userData,
        updatedAt: timestamp
      });
    } else {
      // Создаем нового пользователя
      console.log("syncUserWithFirestore: Создаем нового пользователя", uid);
      await setDoc(userRef, {
        ...userData,
        createdAt: timestamp,
        updatedAt: timestamp,
        characters: []
      });
    }
    
    return uid;
  } catch (error) {
    console.error("Ошибка при синхронизации пользователя с Firestore:", error);
    return null;
  }
};

/**
 * Получает данные пользователя из Firestore
 * @returns Promise с данными пользователя или null
 */
export const getCurrentUserWithData = async (): Promise<FirestoreUserData | null> => {
  try {
    const uid = getCurrentUid();
    if (!uid) {
      console.error("getCurrentUserWithData: Пользователь не авторизован");
      return null;
    }

    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      console.log("getCurrentUserWithData: Данные пользователя получены");
      return userDoc.data() as FirestoreUserData;
    } else {
      console.log("getCurrentUserWithData: Пользователь найден в Firebase Auth, но не в Firestore");
      return null;
    }
  } catch (error) {
    console.error("Ошибка при получении данных пользователя:", error);
    return null;
  }
};
