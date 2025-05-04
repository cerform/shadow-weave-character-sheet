
import { auth } from '@/services/firebase';

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
