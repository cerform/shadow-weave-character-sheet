
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase';
import { getCurrentUid, getCurrentUserIdExtended } from '@/utils/authHelpers';
import { Character } from '@/types/character';
import { auth } from '@/services/firebase/auth';

/**
 * Функция для тестирования получения персонажей пользователя
 * с соблюдением правил безопасности Firestore
 */
export const testLoadCharacters = async (): Promise<{
  success: boolean;
  message: string;
  characters: Character[];
  debug: Record<string, any>;
}> => {
  const debug: Record<string, any> = {};
  
  try {
    // Получаем текущий ID пользователя всеми доступными способами
    const userId = getCurrentUserIdExtended();
    debug.userId = userId;
    
    // Добавляем больше отладочной информации
    debug.authCurrentUser = auth.currentUser ? {
      uid: auth.currentUser.uid,
      email: auth.currentUser.email,
      isAnonymous: auth.currentUser.isAnonymous,
      emailVerified: auth.currentUser.emailVerified
    } : null;
    
    if (!userId) {
      return {
        success: false,
        message: 'Ошибка: Пользователь не авторизован или невозможно получить ID',
        characters: [],
        debug
      };
    }
    
    // Создаем запрос с обязательным фильтром userId для соблюдения правил безопасности
    const charactersCollection = collection(db, 'characters');
    const charactersQuery = query(
      charactersCollection, 
      where('userId', '==', userId)
    );
    
    debug.query = {
      collection: 'characters',
      filter: `userId == ${userId}`,
      whereClause: 'where("userId", "==", userId)'
    };
    
    // Выполняем запрос
    console.log('Загрузка персонажей для пользователя:', userId);
    const querySnapshot = await getDocs(charactersQuery);
    
    debug.snapshotSize = querySnapshot.size;
    debug.snapshotEmpty = querySnapshot.empty;
    
    // Проверяем результат запроса
    if (querySnapshot.empty) {
      return {
        success: true,
        message: 'Запрос выполнен успешно, но персонажи не найдены',
        characters: [],
        debug
      };
    }
    
    // Преобразуем результаты запроса в массив персонажей
    const characters: Character[] = [];
    querySnapshot.forEach(doc => {
      const data = doc.data();
      characters.push({
        ...data,
        id: doc.id
      } as Character);
    });
    
    debug.charactersCount = characters.length;
    debug.firstCharacter = characters[0] ? {
      id: characters[0].id,
      name: characters[0].name,
      userId: characters[0].userId
    } : null;
    
    return {
      success: true,
      message: `Загружено ${characters.length} персонажей`,
      characters,
      debug
    };
  } catch (error) {
    console.error('Ошибка при тестировании загрузки персонажей:', error);
    return {
      success: false,
      message: `Ошибка: ${error instanceof Error ? error.message : String(error)}`,
      characters: [],
      debug: {
        ...debug,
        error: error instanceof Error ? error.message : String(error)
      }
    };
  }
};

/**
 * Утилита для получения ID текущего пользователя в Firebase
 */
export const getCurrentUserDetails = (): {
  uid: string | null;
  isAuthenticated: boolean;
} => {
  const uid = getCurrentUserIdExtended();
  return {
    uid,
    isAuthenticated: !!uid
  };
};

/**
 * Вспомогательная функция для отладки состояния аутентификации
 */
export const debugAuthState = (): Record<string, any> => {
  const authData: Record<string, any> = {
    currentUserFromAuth: auth.currentUser ? {
      uid: auth.currentUser.uid,
      email: auth.currentUser.email
    } : null,
    uidFromHelpers: getCurrentUid(),
    extendedUidFromHelpers: getCurrentUserIdExtended()
  };
  
  // Проверяем localStorage
  try {
    const savedUser = localStorage.getItem('authUser');
    authData.savedUserInLocalStorage = savedUser ? JSON.parse(savedUser) : null;
  } catch (e) {
    authData.localStorageError = String(e);
  }
  
  return authData;
};
