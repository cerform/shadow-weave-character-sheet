
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser 
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

// ВАЖНО: Не создаем провайдер заранее, а создаем новый экземпляр при каждом вызове
// Это помогает избежать проблем с кэшированием провайдера

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
  };
  
  // Возвращаем соответствующее сообщение для кода ошибки или стандартное сообщение
  return errorMessages[errorCode] || error.message || 'Произошла неизвестная ошибка при аутентификации.';
};

// Расширенное логирование ошибок
const logAuthError = (action: string, error: any) => {
  console.error(`[AUTH ERROR] ${action}:`, error);
  console.error(`Error Code: ${error.code}`);
  console.error(`Error Message: ${error.message}`);
  console.error(`Formatted Message: ${formatFirebaseError(error)}`);
  
  // Дополнительные детали для отладки Google авторизации
  if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
    console.warn('Popup проблемы: Проверьте настройки блокировки всплывающих окон в браузере');
  }
  
  if (error.code === 'auth/unauthorized-domain') {
    console.warn(`Домен не авторизован: ${window.location.origin} должен быть добавлен в список авторизованных доменов в консоли Firebase`);
  }
  
  // Логируем полный объект ошибки для более глубокого анализа
  console.error('Полный объект ошибки:', error);
  
  return error;
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
      logAuthError('Регистрация по email', error);
      const formattedError = { ...error, message: formatFirebaseError(error) };
      throw formattedError;
    }
  },

  // Вход с Email и паролем
  loginWithEmail: async (email: string, password: string): Promise<FirebaseUser | null> => {
    try {
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      return userCredential.user;
    } catch (error: any) {
      logAuthError('Вход по email', error);
      const formattedError = { ...error, message: formatFirebaseError(error) };
      throw formattedError;
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
      
      // Используем signInWithPopup с новым провайдером
      console.log("[AUTH] Вызываем signInWithPopup...");
      const result = await signInWithPopup(firebaseAuth, provider);
      console.log("[AUTH] Google login успешен:", result.user);
      return result.user;
    } catch (error: any) {
      logAuthError('Вход через Google', error);
      console.error('[AUTH] Ошибка при входе через Google. Полная информация:', {
        errorCode: error.code,
        errorMessage: error.message,
        email: error.email,
        credential: error.credential
      });
      
      // Специфичная обработка для ошибок popup
      if (error.code === 'auth/popup-blocked') {
        console.warn('[AUTH] Блокировка popup! Проверьте настройки браузера.');
        error.message = 'Всплывающее окно заблокировано. Пожалуйста, разрешите всплывающие окна для этого сайта и попробуйте снова.';
      }
      
      const formattedError = { ...error, message: formatFirebaseError(error) };
      throw formattedError;
    }
  },

  // Выход из системы
  logout: async (): Promise<void> => {
    try {
      await signOut(firebaseAuth);
    } catch (error: any) {
      logAuthError('Выход из системы', error);
      const formattedError = { ...error, message: formatFirebaseError(error) };
      throw formattedError;
    }
  },

  // Слушатель изменения состояния аутентификации
  onAuthStateChanged: (callback: (user: FirebaseUser | null) => void) => {
    return onAuthStateChanged(firebaseAuth, callback);
  }
};

export { app, db, storage, auth, firebaseAuth, analyticsPromise };
