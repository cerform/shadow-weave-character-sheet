
// Файл с вспомогательными функциями для аутентификации

// Функция для получения текущего ID пользователя из Firebase Auth
export function getCurrentUid(): string | null {
  try {
    // Проверяем наличие данных в localStorage
    const user = localStorage.getItem('auth-user');
    if (user) {
      const userData = JSON.parse(user);
      return userData.uid || null;
    }
    
    // Проверяем наличие auth в window.firebase
    if (window && (window as any).firebase && (window as any).firebase.auth) {
      const currentUser = (window as any).firebase.auth().currentUser;
      return currentUser?.uid || null;
    }
    
    return null;
  } catch (e) {
    console.error('Ошибка при получении ID пользователя:', e);
    return null;
  }
}

// Функция для получения токена пользователя
export function getUserToken(): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      // Проверяем наличие auth в window.firebase
      if (window && (window as any).firebase && (window as any).firebase.auth) {
        const currentUser = (window as any).firebase.auth().currentUser;
        if (currentUser) {
          currentUser.getIdToken()
            .then((token: string) => resolve(token))
            .catch(() => resolve(null));
        } else {
          resolve(null);
        }
      } else {
        resolve(null);
      }
    } catch (e) {
      console.error('Ошибка при получении токена:', e);
      resolve(null);
    }
  });
}

// Проверяет, авторизован ли пользователь
export function isUserAuthenticated(): boolean {
  return getCurrentUid() !== null;
}
