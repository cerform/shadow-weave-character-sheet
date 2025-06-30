
import { getAuth } from 'firebase/auth';

// Получение текущего UID пользователя
export const getCurrentUid = (): string | null => {
  const auth = getAuth();
  return auth.currentUser?.uid || null;
};

// Проверка аутентификации
export const isAuthenticated = (): boolean => {
  const auth = getAuth();
  return !!auth.currentUser;
};

// Получение данных текущего пользователя
export const getCurrentUser = () => {
  const auth = getAuth();
  return auth.currentUser;
};
