
import { firebaseAuth } from '@/services/firebase';

/**
 * Проверяет, аутентифицирован ли текущий пользователь
 * @returns true, если пользователь аутентифицирован
 */
export const isAuthenticated = (): boolean => {
  return !!firebaseAuth.currentUser;
};

/**
 * Получает объект текущего аутентифицированного пользователя
 * @returns объект пользователя или null
 */
export const getCurrentUser = () => {
  return firebaseAuth.currentUser;
};

/**
 * Получает UID текущего аутентифицированного пользователя
 * @returns UID пользователя или null
 */
export const getCurrentUid = (): string | null => {
  return firebaseAuth.currentUser?.uid || null;
};
