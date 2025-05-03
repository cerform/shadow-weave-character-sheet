
import { auth } from "@/services/firebase";

/**
 * Получить текущий UID пользователя
 * @returns UID пользователя или null, если пользователь не авторизован
 */
export const getCurrentUid = (): string | null => {
  const user = auth.currentUser;
  return user ? user.uid : null;
};

/**
 * Проверить, авторизован ли текущий пользователь
 * @returns true если пользователь авторизован, иначе false
 */
export const isUserAuthenticated = (): boolean => {
  return !!auth.currentUser;
};

/**
 * Обертка для функций, требующих аутентификации
 * @param callback Функция, требующая аутентификации
 * @returns Результат выполнения функции или исключение, если пользователь не авторизован
 */
export const requireAuth = async <T>(callback: () => Promise<T>): Promise<T> => {
  if (!isUserAuthenticated()) {
    throw new Error("Действие требует авторизации. Пожалуйста, войдите в свой аккаунт.");
  }
  return await callback();
};
