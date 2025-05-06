
import { auth } from '@/services/firebase/auth';
import { useAuth } from '@/hooks/use-auth';

/**
 * Получает текущий UID пользователя или null если пользователь не авторизован
 * Сначала пытается получить через auth.currentUser, затем через контекст
 */
export const getCurrentUid = (): string | null => {
  // Первый способ: напрямую из Firebase Auth
  const currentUser = auth.currentUser;
  if (currentUser) {
    return currentUser.uid;
  }
  
  // Второй способ: из localStorage (если пользователь был сохранен)
  try {
    const savedUser = localStorage.getItem('authUser');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser && (parsedUser.uid || parsedUser.id)) {
        return parsedUser.uid || parsedUser.id;
      }
    }
  } catch (error) {
    console.error('Ошибка при чтении из localStorage:', error);
  }
  
  // Если не удалось получить UID
  return null;
};

/**
 * Расширенная функция для получения текущего пользователя с бОльшим количеством источников
 */
export const getCurrentUserIdExtended = (): string | null => {
  // Проверяем базовую функцию
  const basicUid = getCurrentUid();
  if (basicUid) return basicUid;
  
  // Если не удалось получить UID базовыми методами - вернем null
  return null;
};
