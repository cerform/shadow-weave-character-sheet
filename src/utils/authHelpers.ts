
import { auth } from "@/services/firebase";
import { getUserData, updateUserData } from "./firestoreHelpers";

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

interface UserDataForSync {
  username?: string;
  email?: string;
  isDM?: boolean;
  displayName?: string;
  characters?: string[];
  campaigns?: string[];
}

/**
 * Синхронизация данных пользователя с Firestore
 * @param userData Данные пользователя для синхронизации
 * @returns true если данные успешно синхронизированы, иначе false
 */
export const syncUserWithFirestore = async (userData: UserDataForSync) => {
  const uid = getCurrentUid();
  if (!uid) return false;
  
  try {
    // Получаем текущие данные пользователя из Firestore
    const currentData = await getUserData(uid);
    
    // Данные для обновления
    const updateData = {
      ...userData
    };
    
    // Если данных нет, создаем новый документ с начальными значениями
    if (!currentData) {
      updateData.displayName = userData.displayName || userData.username || auth.currentUser?.displayName || 'User';
      updateData.email = userData.email || auth.currentUser?.email || '';
      updateData.isDM = userData.isDM || false;
      updateData.characters = userData.characters || [];
      updateData.campaigns = userData.campaigns || [];
    }
    
    // Обновляем данные в Firestore
    const updated = await updateUserData(uid, updateData);
    return updated;
  } catch (error) {
    console.error("Ошибка при синхронизации пользователя с Firestore:", error);
    return false;
  }
};

/**
 * Получить текущего пользователя с данными из Firestore
 * @returns Данные пользователя или null
 */
export const getCurrentUserWithData = async () => {
  const uid = getCurrentUid();
  if (!uid) return null;
  
  try {
    return await getUserData(uid);
  } catch (error) {
    console.error("Ошибка при получении данных пользователя:", error);
    return null;
  }
};
