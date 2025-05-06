
import { auth } from '@/firebase';

/**
 * Получает UID текущего авторизованного пользователя
 * @returns string | null - UID пользователя или null, если не авторизован
 */
export const getCurrentUid = (): string | null => {
  const currentUser = auth.currentUser;
  
  if (currentUser) {
    return currentUser.uid;
  }
  
  // Если пользователь не авторизован в Firebase, проверяем localStorage
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.uid || user.id || null;
    }
  } catch (e) {
    console.error('Error getting user from localStorage:', e);
  }
  
  return null;
};

/**
 * Проверяет аутентификацию пользователя
 * @returns boolean - true, если пользователь аутентифицирован
 */
export const isUserAuthenticated = (): boolean => {
  return !!getCurrentUid();
};

/**
 * Получает данные текущего пользователя
 * @returns any - данные пользователя или null
 */
export const getCurrentUser = (): any | null => {
  if (auth.currentUser) {
    return auth.currentUser;
  }
  
  // Если пользователь не авторизован в Firebase, проверяем localStorage
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
  } catch (e) {
    console.error('Error getting user from localStorage:', e);
  }
  
  return null;
};
