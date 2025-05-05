
/**
 * Расширенная ошибка аутентификации Firebase
 */
export interface DetailedAuthError extends Error {
  code: string;
  customData?: {
    email?: string;
    phoneNumber?: string;
    tenantId?: string;
  };
  fullDetails?: any;
  originalError?: any;
}

// Функция для форматирования сообщений ошибок Firebase
export const formatFirebaseError = (error: any): string => {
  const errorCode = error.code || '';
  const currentDomain = typeof window !== 'undefined' ? window.location.origin : 'текущий домен';
  
  // Карта пользовательских сообщений для известных ошибок
  const errorMessages: {[key: string]: string} = {
    'auth/user-not-found': 'Пользователь с таким email не найден.',
    'auth/wrong-password': 'Неверный пароль. Пожалуйста, проверьте пароль и попробуйте еще раз.',
    'auth/email-already-in-use': 'Этот email уже используется. Пожалуйста, используйте другой email или войдите в систему.',
    'auth/weak-password': 'Пароль слишком слабый. Используйте более сложный пароль.',
    'auth/invalid-email': 'Введен некорректный email.',
    'auth/operation-not-allowed': 'Этот метод входа не включен. Пожалуйста, свяжитесь с администратором.',
    'auth/account-exists-with-different-credential': 'Этот email уже связан с другим методом входа.',
    'auth/unauthorized-domain': `Домен "${currentDomain}" не авторизован для аутентификации Firebase. Добавьте этот домен в список разрешенных в консоли Firebase (Authentication > Settings > Authorized domains).`,
    'auth/popup-closed-by-user': 'Окно авторизации было закрыто до завершения процесса.',
    'auth/cancelled-popup-request': 'Операция отменена из-за нового запроса входа.',
    'auth/popup-blocked': 'Всплывающее окно авторизации заблокировано браузером. Разрешите всплывающие окна для этого сайта и повторите попытку.',
    'auth/internal-error': 'Внутренняя ошибка Firebase. Попробуйте позже или используйте другой метод входа.',
    'auth/network-request-failed': 'Ошибка сети. Проверьте подключение к интернету.',
    'auth/too-many-requests': 'Слишком много запросов. Попробуйте позже.',
    'auth/web-storage-unsupported': 'Веб-хранилище не поддерживается или отключено. Включите cookies в браузере.',
    'auth/popup-redirect-error': 'Ошибка при перенаправлении. Возможно, блокировка всплывающих окон.',
    'auth/redirect-cancelled-by-user': 'Перенаправление отменено пользователем.',
    'auth/redirect-operation-pending': 'Перенаправление уже выполняется.',
    'auth/timeout': 'Превышено время ожидания запроса. Проверьте подключение к интернету.',
    'auth/invalid-credential': 'Недействительные учетные данные аутентификации. Проверьте данные и попробуйте снова.',
    'auth/user-disabled': 'Этот аккаунт отключен администратором.',
    'auth/invalid-verification-code': 'Неверный код подтверждения. Проверьте и попробуйте снова.',
    'auth/captcha-check-failed': 'Проверка капчи не пройдена. Попробуйте снова.',
    'auth/missing-verification-code': 'Отсутствует код подтверждения.',
    'auth/quota-exceeded': 'Превышена квота на операции. Попробуйте позже.',
    'auth/cors-unsupported': 'Ваш браузер не поддерживает CORS. Используйте современный браузер.',
    'auth/invalid-action-code': 'Недействительный код действия. Возможно, код устарел или неверен.',
    'auth/missing-auth-domain': 'Отсутствует конфигурация для домена аутентификации.',
    'auth/missing-continue-uri': 'Отсутствует URL-адрес для продолжения операции.',
    'auth/invalid-continue-uri': 'Неверный URL-адрес для продолжения операции.',
    'auth/unauthorized-continue-uri': 'Неавторизованный URL-адрес для продолжения операции.',
    'auth/invalid-dynamic-link-domain': 'Неверный домен для динамической ссылки.',
    'auth/credential-already-in-use': 'Учетные данные уже используются другой учетной записью.',
    'auth/app-deleted': 'Приложение Firebase было удалено.',
    'auth/app-not-authorized': 'Приложение не авторизовано для использования API Firebase Auth.',
    'auth/argument-error': 'Ошибка в аргументах функции. Проверьте параметры запроса.',
    'auth/invalid-api-key': 'Неверный API-ключ Firebase.',
    'auth/invalid-tenant-id': 'Неверный идентификатор арендатора Firebase Auth.',
    'auth/invalid-user-token': 'Токен пользователя недействителен. Войдите в систему снова.',
    'auth/token-expired': 'Срок действия токена истек. Войдите в систему снова.',
    'auth/user-token-mismatch': 'Несоответствие токена пользователя. Войдите в систему снова.',
    'permission-denied': 'Доступ запрещен. Проверьте права доступа.',
    'auth/login-cancelled': 'Вход отменен пользователем или не завершен.',
    'auth/popup-closed-by-system': 'Всплывающее окно было закрыто системой (на некоторых мобильных устройствах это может происходить автоматически).',
    'auth/provider-already-linked': 'Этот провайдер уже связан с вашей учетной записью.',
    'auth/provider-not-found': 'Указанный провайдер не поддерживается.',
    'auth/requires-recent-login': 'Для этой операции требуется недавний вход. Пожалуйста, войдите снова.',
    'auth/missing-google-auth-token': 'Отсутствует токен Google аутентификации.',
    'auth/google-auth-cancelled': 'Google аутентификация была отменена.',
    'auth/google-auth-error': 'Ошибка при аутентификации через Google.',
    'auth/null-response': 'Сервер вернул пустой ответ при аутентификации.',
  };
  
  // Возвращаем соответствующее сообщение для кода ошибки или стандартное сообщение
  return errorMessages[errorCode] || error.message || 'Произошла неизвестная ошибка при аутентификации.';
};

// Расширенное логирование ошибок
export const logAuthError = (action: string, error: any): DetailedAuthError => {
  // Создаем расширенный объект ошибки для сохранения деталей
  const detailedError: DetailedAuthError = new Error(error.message) as DetailedAuthError;
  detailedError.name = error.name || 'AuthError';
  detailedError.code = error.code || 'unknown-error';
  detailedError.fullDetails = {
    originalAction: action,
    code: error.code,
    message: error.message,
    errorName: error.name,
    customData: error.customData,
    formattedMessage: formatFirebaseError(error),
    environment: {
      userAgent: navigator.userAgent,
      domain: window.location.origin,
      language: navigator.language,
      timestamp: new Date().toISOString(),
      platform: navigator.platform,
      hasPopups: !window.opener && window.innerWidth > 0,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      currentUrl: window.location.href,
      referrer: document.referrer,
      hasLocalStorage: !!window.localStorage,
      hasSessionStorage: !!window.sessionStorage,
      hasCookies: navigator.cookieEnabled,
    }
  };
  
  // Логируем полную информацию об ошибке в консоль для отладки
  console.error(`[AUTH ERROR] ${action}:`, detailedError);
  console.error(`Error Code: ${error.code}`);
  console.error(`Error Message: ${error.message}`);
  console.error(`Formatted Message: ${formatFirebaseError(error)}`);
  console.error(`Full Details:`, detailedError.fullDetails);
  
  // Дополнительные детали для отладки Google авторизации
  if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
    console.warn('Popup проблемы: Проверьте настройки блокировки всплывающих окон в браузере');
    console.warn('Статус блокировки popup:', window.opener ? 'Окно открыто' : 'Окно заблокировано');
    console.warn('Настройки браузера:', navigator.userAgent);
  }
  
  if (error.code === 'auth/unauthorized-domain') {
    console.warn(`Домен не авторизован: ${window.location.origin} должен быть добавлен в список авторизованных доменов в консоли Firebase`);
    console.warn('Текущий домен:', window.location.hostname);
    console.warn('Полный URL:', window.location.href);
  }
  
  // Проверка на ошибки CORS и сетевые проблемы
  if (error.code === 'auth/network-request-failed' || error.code === 'auth/internal-error') {
    console.warn('Сетевая или внутренняя ошибка Firebase:');
    console.warn('Статус сети:', navigator.onLine ? 'Онлайн' : 'Офлайн');
    console.warn('Текущий URL:', window.location.href);
  }
  
  // Проверка прав доступа
  if (error.code === 'permission-denied') {
    console.warn('Ошибка доступа Firebase:');
    console.warn('Проверьте правила безопасности в консоли Firebase');
  }
  
  return detailedError;
};
