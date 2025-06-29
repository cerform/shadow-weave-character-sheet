
export interface DetailedAuthError {
  code: string;
  message: string;
  details: string;
  action: string;
}

export const logAuthError = (operation: string, error: any): DetailedAuthError => {
  const errorCode = error.code || 'unknown';
  const errorMessage = error.message || 'Неизвестная ошибка';
  
  const errorMap: Record<string, { message: string; action: string }> = {
    'auth/user-not-found': {
      message: 'Пользователь с таким email не найден',
      action: 'Проверьте правильность email или зарегистрируйтесь'
    },
    'auth/wrong-password': {
      message: 'Неверный пароль',
      action: 'Проверьте правильность пароля или восстановите его'
    },
    'auth/email-already-in-use': {
      message: 'Пользователь с таким email уже существует',
      action: 'Войдите в существующий аккаунт или используйте другой email'
    },
    'auth/weak-password': {
      message: 'Пароль слишком простой',
      action: 'Используйте пароль длиной не менее 6 символов'
    },
    'auth/invalid-email': {
      message: 'Неверный формат email',
      action: 'Проверьте правильность ввода email адреса'
    },
    'auth/popup-blocked': {
      message: 'Всплывающее окно заблокировано браузером',
      action: 'Разрешите всплывающие окна для этого сайта и попроб��йте снова'
    },
    'auth/popup-closed-by-user': {
      message: 'Окно авторизации было закрыто',
      action: 'Попробуйте войти снова и не закрывайте окно авторизации'
    },
    'auth/cancelled-popup-request': {
      message: 'Запрос авторизации был отменен',
      action: 'Попробуйте войти снова'
    }
  };

  const errorInfo = errorMap[errorCode] || {
    message: errorMessage,
    action: 'Обратитесь в службу поддержки если проблема повторяется'
  };

  const detailedError: DetailedAuthError = {
    code: errorCode,
    message: errorInfo.message,
    details: `${operation}: ${errorMessage}`,
    action: errorInfo.action
  };

  console.error(`[AUTH ERROR] ${operation}:`, {
    code: errorCode,
    message: errorMessage,
    details: detailedError
  });

  return detailedError;
};
