
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
    // Проверяем наличие пользователя напрямую из auth
    if (!auth.currentUser) {
      console.warn('authHelpers: Текущий пользователь не найден в auth.currentUser');
      
      // Пробуем получить ID из localStorage
      const savedUser = localStorage.getItem('authUser');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          if (parsedUser && (parsedUser.uid || parsedUser.id)) {
            const recoveredId = parsedUser.uid || parsedUser.id;
            console.log('authHelpers: Восстановлен ID пользователя из localStorage:', recoveredId);
            return recoveredId;
          }
        } catch (e) {
          console.error('authHelpers: Ошибка при парсинге данных пользователя из localStorage:', e);
        }
      }
      
      console.warn('authHelpers: Не удалось получить ID пользователя, используется пустой ID');
      return '';
    }
    
    const uid = auth.currentUser.uid;
    console.log('authHelpers: ID пользователя получен успешно:', uid);
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
  const isAuth = auth.currentUser !== null;
  console.log('authHelpers: Проверка аутентификации:', isAuth);
  
  // Если пользователь авторизован, выводим дополнительную информацию
  if (isAuth) {
    const user = auth.currentUser;
    console.log(`authHelpers: Пользователь авторизован (${user!.uid}), email: ${user!.email}`);
  }
  
  return isAuth;
};

/**
 * Проверяет, имеет ли текущий пользователь доступ к указанному ресурсу
 * @param resourceOwnerId ID владельца ресурса
 * @returns true, если текущий пользователь является владельцем ресурса
 */
export const hasAccessToResource = (resourceOwnerId: string | undefined): boolean => {
  if (!resourceOwnerId) {
    console.log('authHelpers: ID владельца ресурса не указан');
    return false;
  }
  
  const currentUserId = getCurrentUid();
  if (!currentUserId) {
    console.log('authHelpers: Текущий пользователь не аутентифицирован');
    return false;
  }
  
  const hasAccess = currentUserId === resourceOwnerId;
  console.log(`authHelpers: Проверка доступа к ресурсу ${resourceOwnerId}:`, hasAccess);
  return hasAccess;
};

/**
 * Сохраняет пользователя в localStorage
 * @param user Данные пользователя
 */
export const saveUserToLocalStorage = (user: any): void => {
  if (!user) return;
  
  try {
    const userData = {
      uid: user.uid,
      id: user.uid, // Дублируем для совместимости
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    };
    
    localStorage.setItem('authUser', JSON.stringify(userData));
    console.log('authHelpers: Пользователь сохранен в localStorage:', userData.uid);
  } catch (error) {
    console.error('authHelpers: Ошибка при сохранении пользователя в localStorage:', error);
  }
};

/**
 * Получает данные пользователя из localStorage
 * @returns Данные пользователя или null
 */
export const getUserFromLocalStorage = (): any => {
  try {
    const savedUser = localStorage.getItem('authUser');
    if (!savedUser) return null;
    
    const parsedUser = JSON.parse(savedUser);
    console.log('authHelpers: Пользователь получен из localStorage:', parsedUser.uid || parsedUser.id);
    return parsedUser;
  } catch (error) {
    console.error('authHelpers: Ошибка при получении пользователя из localStorage:', error);
    return null;
  }
};
