
import { auth } from "@/services/firebase";
import { getUserData, updateUserData } from "./firestoreHelpers";

// Флаг для отслеживания вывода предупреждений
let authWarningShown = false;

// Вывод предупреждения только один раз
const showAuthWarningOnce = (message: string) => {
  if (!authWarningShown) {
    console.warn(message);
    authWarningShown = true;
  }
};

/**
 * Получить текущий UID пользователя
 * @returns UID пользователя или null, если пользователь не авторизован
 */
export const getCurrentUid = (): string | null => {
  try {
    const user = auth.currentUser;
    return user ? user.uid : null;
  } catch (error) {
    showAuthWarningOnce("Ошибка при получении UID пользователя, используется автономный режим");
    return null;
  }
};

/**
 * Проверить, авторизован ли текущий пользователь
 * @returns true если пользователь авторизован, иначе false
 */
export const isUserAuthenticated = (): boolean => {
  try {
    return !!auth.currentUser;
  } catch (error) {
    showAuthWarningOnce("Ошибка при проверке аутентификации, используется автономный режим");
    return false;
  }
};

/**
 * Обертка для функций, требующих аутентификации
 * @param callback Функция, требующая аутентификации
 * @returns Результат выполнения функции или исключение, если пользователь не авторизован
 */
export const requireAuth = async <T>(callback: () => Promise<T>): Promise<T> => {
  try {
    if (!isUserAuthenticated()) {
      throw new Error("Действие требует авторизации. Пожалуйста, войдите в свой аккаунт.");
    }
    return await callback();
  } catch (error) {
    showAuthWarningOnce("Ошибка при проверке аутентификации, используется автономный режим");
    throw new Error("Действие требует авторизации. Приложение работает в автономном режиме.");
  }
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
  try {
    const uid = getCurrentUid();
    if (!uid) return false;
    
    console.log("Синхронизация пользователя с Firestore:", uid);
    
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
    } else {
      // Если у пользователя уже есть персонажи, сохраняем их
      if (currentData.characters && Array.isArray(currentData.characters) && currentData.characters.length > 0) {
        updateData.characters = [...new Set([...currentData.characters, ...(userData.characters || [])])];
      }
      
      // Если у пользователя уже есть кампании, сохраняем их
      if (currentData.campaigns && Array.isArray(currentData.campaigns) && currentData.campaigns.length > 0) {
        updateData.campaigns = [...new Set([...currentData.campaigns, ...(userData.campaigns || [])])];
      }
    }
    
    // Обновляем данные в Firestore
    const updated = await updateUserData(uid, updateData);
    return updated;
  } catch (error) {
    showAuthWarningOnce("Ошибка при синхронизации пользователя с Firestore, используется автономный режим");
    return false;
  }
};

/**
 * Получить текущего пользователя с данными из Firestore
 * @returns Данные пользователя или null
 */
export const getCurrentUserWithData = async () => {
  try {
    const uid = getCurrentUid();
    if (!uid) return null;
    
    return await getUserData(uid);
  } catch (error) {
    showAuthWarningOnce("Ошибка при получении данных пользователя, используется автономный режим");
    return null;
  }
};
