
import { FirebaseError } from 'firebase/app';

export interface DetailedAuthError extends Error {
  code?: string;
  context?: string;
  originalError?: FirebaseError;
}

// Функция для логирования ошибок Firebase Auth с детальной информацией
export const logAuthError = (context: string, error: FirebaseError): DetailedAuthError => {
  // Создаем подробное описание ошибки
  const detailedError: DetailedAuthError = new Error(
    getReadableAuthErrorMessage(error) || error.message
  );
  
  detailedError.name = "AuthError";
  detailedError.code = error.code;
  detailedError.context = context;
  detailedError.originalError = error;
  
  // Логируем ошибку с контекстом
  console.error(`[AUTH ERROR] ${context}:`, {
    message: detailedError.message,
    code: error.code,
    originalError: error
  });
  
  return detailedError;
};

// Преобразует код ошибки Firebase Auth в читаемое сообщение
export const getReadableAuthErrorMessage = (error: FirebaseError): string => {
  const errorCode = error.code;
  
  // Коды ошибок Firebase Auth: https://firebase.google.com/docs/auth/admin/errors
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'Этот email уже используется другой учетной записью';
    case 'auth/invalid-email':
      return 'Неверный формат email';
    case 'auth/user-disabled':
      return 'Эта учетная запись отключена';
    case 'auth/user-not-found':
      return 'Пользователь с таким email не найден';
    case 'auth/wrong-password':
      return 'Неверный пароль';
    case 'auth/weak-password':
      return 'Пароль должен содержать не менее 6 символов';
    case 'auth/popup-closed-by-user':
      return 'Вход отменен. Окно авторизации было закрыто до завершения';
    case 'auth/popup-blocked':
      return 'Браузер заблокировал всплывающее окно. Пожалуйста, разрешите всплывающие окна для этого сайта';
    case 'auth/cancelled-popup-request':
      return 'Запрос авторизации был отменен';
    case 'auth/account-exists-with-different-credential':
      return 'Email уже используется другим способом входа. Попробуйте войти используя другой метод';
    case 'auth/network-request-failed':
      return 'Проблема с сетевым подключением. Проверьте подключение к интернету';
    case 'auth/timeout':
      return 'Время запроса истекло. Проверьте подключение к интернету';
    case 'auth/too-many-requests':
      return 'Слишком много неудачных попыток входа. Попробуйте позже';
    default:
      return error.message;
  }
};
