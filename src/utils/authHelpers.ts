
import { auth } from "@/firebase";

/**
 * Получает ID текущего пользователя, если он аутентифицирован
 * @returns ID пользователя или null
 */
export const getCurrentUid = (): string | null => {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const uid = currentUser.uid;
      console.log('authHelpers: ID текущего пользователя:', uid);
      return uid;
    }
    console.log('authHelpers: Пользователь не аутентифицирован');
    return null;
  } catch (error) {
    console.error('authHelpers: Ошибка при получении ID пользователя:', error);
    return null;
  }
};

/**
 * Расширенная версия getCurrentUid с дополнительной обработкой ошибок
 * @returns ID пользователя или пустая строка
 */
export const getCurrentUserIdExtended = (): string => {
  try {
    const uid = getCurrentUid();
    if (!uid) {
      console.warn('authHelpers: Не удалось получить ID пользователя, используется пустой ID');
      return '';
    }
    return uid;
  } catch (error) {
    console.error('authHelpers: Критическая ошибка при получении ID пользователя:', error);
    return '';
  }
};

/**
 * Проверяет, авторизован ли текущий пользователь
 * @returns true, если пользователь авторизован
 */
export const isUserAuthenticated = (): boolean => {
  return auth.currentUser !== null;
};

/**
 * Проверяет, имеет ли текущий пользователь доступ к указанному ресурсу
 * @param resourceOwnerId ID владельца ресурса
 * @returns true, если текущий пользователь является владельцем ресурса
 */
export const hasAccessToResource = (resourceOwnerId: string | undefined): boolean => {
  if (!resourceOwnerId) return false;
  
  const currentUserId = getCurrentUid();
  if (!currentUserId) return false;
  
  return currentUserId === resourceOwnerId;
};
