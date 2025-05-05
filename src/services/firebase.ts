
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  AuthError,
  AuthErrorCodes 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from "firebase/analytics";

// Конфигурация Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAeKvsN-wul7CsemTA-cFxZI0iO9sWe0fg",
  authDomain: "shadow-char.firebaseapp.com",
  projectId: "shadow-char",
  storageBucket: "shadow-char.appspot.com", 
  messagingSenderId: "815261687102",
  appId: "1:815261687102:web:5497647ed6ff449a57e06f",
  measurementId: "G-KQ3M1GQJX2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only if supported (prevents errors in environments like SSR)
const initializeAnalytics = async () => {
  try {
    if (await isSupported()) {
      return getAnalytics(app);
    }
    return null;
  } catch (error) {
    console.warn("Analytics not initialized:", error);
    return null;
  }
};

// Initialize asynchronously but don't wait
const analyticsPromise = initializeAnalytics();

// Initialize other Firebase services immediately
const firebaseAuth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

/**
 * Расширенная ошибка аутентификации Firebase
 */
interface DetailedAuthError extends Error {
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
const formatFirebaseError = (error: any): string => {
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
  };
  
  // Возвращаем соответствующее сообщение для кода ошибки или стандартное сообщение
  return errorMessages[errorCode] || error.message || 'Произошла неизвестная ошибка при аутентификации.';
};

// Расширенное логирование ошибок
const logAuthError = (action: string, error: any): DetailedAuthError => {
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

// Функции для аутентификации
const auth = {
  // Текущий пользователь
  currentUser: firebaseAuth.currentUser,

  // Регистрация с Email и паролем
  registerWithEmail: async (email: string, password: string): Promise<FirebaseUser | null> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      return userCredential.user;
    } catch (error: any) {
      const detailedError = logAuthError('Регистрация по email', error);
      throw detailedError;
    }
  },

  // Вход с Email и паролем
  loginWithEmail: async (email: string, password: string): Promise<FirebaseUser | null> => {
    try {
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      return userCredential.user;
    } catch (error: any) {
      const detailedError = logAuthError('Вход по email', error);
      throw detailedError;
    }
  },

  // Вход через Google
  loginWithGoogle: async (): Promise<FirebaseUser | null> => {
    try {
      console.log("[AUTH] Начинаем вход через Google");
      
      // Проверяем доступность домена для Firebase Auth
      console.log("[AUTH] Текущий домен:", window.location.origin);
      
      // Создаем новый экземпляр провайдера при каждом вызове
      const provider = new GoogleAuthProvider();
      // Настраиваем параметры для гарантированного показа окна выбора аккаунта
      provider.setCustomParameters({
        prompt: 'select_account',
        access_type: 'offline'
      });
      
      console.log("[AUTH] Google провайдер создан с параметрами:", {
        prompt: 'select_account',
        access_type: 'offline'
      });
      
      // Очищаем кэш состояния авторизации перед новым вызовом
      // Это может помочь с проблемой отображения окна выбора аккаунта
      console.log("[AUTH] Выполняем выход для очистки кэша...");
      await firebaseAuth.signOut();
      console.log("[AUTH] Выход выполнен успешно");
      
      // Проверяем состояние браузера перед открытием всплывающего окна
      console.log("[AUTH] Статус браузера:", {
        windowOpener: !!window.opener,
        popupsBlocked: window.screenLeft === 0 && window.screenTop === 0, // Примерная проверка на блокировку
        hasActivePopups: document.querySelectorAll('iframe[src*="accounts.google.com"]').length > 0,
        browserSupportsPopups: typeof window.open === 'function',
        userAgent: navigator.userAgent,
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      });
      
      // Используем signInWithPopup с новым провайдером
      console.log("[AUTH] Вызываем signInWithPopup...");
      const result = await signInWithPopup(firebaseAuth, provider);
      console.log("[AUTH] Google login успешен:", result.user);
      return result.user;
    } catch (error: any) {
      const detailedError = logAuthError('Вход через Google', error);
      console.error('[AUTH] Ошибка при входе через Google. Полная информация:', {
        errorCode: error.code,
        errorMessage: error.message,
        email: error.email,
        credential: error.credential,
        customData: error.customData,
        fullStack: error.stack,
        browser: navigator.userAgent,
        time: new Date().toISOString(),
        domain: window.location.origin
      });
      
      // Попытка получить дополнительную информацию об окне
      try {
        const windowState = {
          innerHeight: window.innerHeight,
          innerWidth: window.innerWidth,
          outerHeight: window.outerHeight,
          outerWidth: window.outerWidth,
          screenX: window.screenX,
          screenY: window.screenY,
          screen: {
            availHeight: window.screen.availHeight,
            availWidth: window.screen.availWidth,
            height: window.screen.height,
            width: window.screen.width
          }
        };
        console.log('[AUTH] Состояние окна браузера:', windowState);
      } catch (windowError) {
        console.error('[AUTH] Ошибка при получении состояния окна:', windowError);
      }
      
      // Специфичная обработка для ошибок popup
      if (error.code === 'auth/popup-blocked') {
        console.warn('[AUTH] Блокировка popup! Проверьте настройки браузера.');
        detailedError.message = 'Всплывающее окно заблокировано. Пожалуйста, разрешите всплывающие окна для этого сайта и попробуйте снова.';
      }
      
      if (error.code === 'auth/popup-closed-by-user') {
        console.warn('[AUTH] Popup закрыт пользователем!');
        detailedError.message = 'Окно авторизации было закрыто до завершения процесса. Пожалуйста, оставьте окно открытым до завершения входа.';
      }
      
      if (error.code === 'auth/cancelled-popup-request') {
        console.warn('[AUTH] Запрос popup отменен!');
        detailedError.message = 'Запрос на открытие всплывающего окна был отменен. Пожалуйста, подождите несколько секунд и попробуйте снова.';
      }
      
      throw detailedError;
    }
  },

  // Выход из системы
  logout: async (): Promise<void> => {
    try {
      await signOut(firebaseAuth);
    } catch (error: any) {
      const detailedError = logAuthError('Выход из системы', error);
      throw detailedError;
    }
  },

  // Слушатель изменения состояния аутентификации
  onAuthStateChanged: (callback: (user: FirebaseUser | null) => void) => {
    return onAuthStateChanged(firebaseAuth, callback);
  }
};

export { app, db, storage, auth, firebaseAuth, analyticsPromise };
