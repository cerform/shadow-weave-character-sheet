
import { auth } from '@/services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Получаем ID текущего пользователя
export const getCurrentUid = (): string | null => {
  const user = auth.currentUser;
  return user ? user.uid : null;
};

// Проверка, авторизован ли пользователь
export const isAuthenticated = (): boolean => {
  return !!auth.currentUser;
};

// Наблюдатель за состоянием авторизации
export const watchAuthState = (callback: (user: any) => void): () => void => {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
};

// Проверка роли пользователя
export const checkUserRole = async (uid: string): Promise<string | null> => {
  if (!uid) return null;
  
  try {
    // Здесь может быть логика получения роли из Firestore или другого источника
    // Для примера возвращаем фиктивные данные
    return 'player';
  } catch (error) {
    console.error('Ошибка при проверке роли пользователя:', error);
    return null;
  }
};
