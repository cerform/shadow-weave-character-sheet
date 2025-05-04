
import { auth } from '@/services/firebase';
import { getDoc, doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/firebase';

// Флаги для отслеживания вывода предупреждений
let authWarningShown = false;
let firestoreWarningShown = false;
let networkWarningShown = false;

// Общая функция для вывода предупреждений только один раз с разными типами
const showWarningOnce = (message: string, warningType: 'auth' | 'firestore' | 'network'): boolean => {
  if (warningType === 'auth' && !authWarningShown) {
    console.warn(message);
    authWarningShown = true;
    return true;
  } else if (warningType === 'firestore' && !firestoreWarningShown) {
    console.warn(message);
    firestoreWarningShown = true;
    return true;
  } else if (warningType === 'network' && !networkWarningShown) {
    console.warn(message);
    networkWarningShown = true;
    return true;
  }
  return false;
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
    showWarningOnce("Ошибка при получении UID пользователя, используется автономный режим", 'auth');
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
    showWarningOnce("Ошибка при проверке аутентификации, используется автономный режим", 'auth');
    return false;
  }
};

/**
 * Получает данные пользователя по UID
 * @param uid ID пользователя
 * @returns Данные пользователя или null
 */
export const getUserData = async (uid: string) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Ошибка при получении данных пользователя:', error);
    return null;
  }
};

/**
 * Создание или обновление документа пользователя
 * @param uid ID пользователя
 * @param userData Данные пользователя
 */
export const updateUserData = async (uid: string, userData: any) => {
  try {
    const userRef = doc(db, 'users', uid);
    
    // Проверяем существует ли документ
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      // Обновление существующего документа
      await updateDoc(userRef, {
        ...userData,
        lastLogin: serverTimestamp()
      });
    } else {
      // Создание нового документа
      await setDoc(userRef, {
        ...userData,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        characters: userData.characters || [],
        campaigns: userData.campaigns || []
      });
    }
    
    return true;
  } catch (error) {
    console.error('Ошибка при обновлении данных пользователя:', error);
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
    showWarningOnce("Ошибка при проверке аутентификации, используется автономный режим", 'auth');
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
    showWarningOnce("Ошибка при синхронизации пользователя с Firestore, используется автономный режим", 'firestore');
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
    showWarningOnce("Ошибка при получении данных пользователя, используется автономный режим", 'firestore');
    return null;
  }
};

// Экспортируем функцию сброса счётчиков предупреждений для тестирования
export const resetWarningCounters = () => {
  authWarningShown = false;
  firestoreWarningShown = false;
  networkWarningShown = false;
};
