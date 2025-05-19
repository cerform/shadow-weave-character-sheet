
/**
 * Получает текущий идентификатор пользователя
 * В локальной версии возвращает ID из localStorage или 'local-user'
 */
export const getCurrentUid = (): string => {
  // Попытка получить ID из localStorage
  const storedUserId = localStorage.getItem('user_id');
  
  if (storedUserId) {
    return storedUserId;
  }
  
  // Если ID не найден, создаём новый и сохраняем
  const newUserId = `local-user-${Date.now()}`;
  localStorage.setItem('user_id', newUserId);
  
  return newUserId;
};

/**
 * Проверяет, аутентифицирован ли пользователь
 */
export const isUserAuthenticated = (): boolean => {
  // В локальной версии считаем пользователя аутентифицированным,
  // если есть ID в localStorage
  return !!localStorage.getItem('user_id');
};

/**
 * Получает данные текущего пользователя
 */
export const getCurrentUser = () => {
  const uid = getCurrentUid();
  
  // В локальной версии возвращаем минимальные данные
  return {
    uid,
    displayName: 'Локальный пользователь',
    email: null,
    photoURL: null
  };
};

/**
 * Выход пользователя
 */
export const signOut = async (): Promise<void> => {
  // В локальной версии просто удаляем ID из localStorage
  localStorage.removeItem('user_id');
};

/**
 * Аутентификация с помощью электронной почты и пароля
 */
export const signInWithEmailAndPassword = async (email: string, password: string): Promise<any> => {
  // В локальной версии просто сохраняем email как ID
  const uid = `local-user-${email.replace(/[^a-zA-Z0-9]/g, '')}`;
  localStorage.setItem('user_id', uid);
  
  return {
    user: {
      uid,
      email,
      displayName: email.split('@')[0],
      photoURL: null
    }
  };
};

/**
 * Регистрация с помощью электронной почты и пароля
 */
export const createUserWithEmailAndPassword = async (email: string, password: string): Promise<any> => {
  // В локальной версии делаем то же самое, что и при входе
  return signInWithEmailAndPassword(email, password);
};
