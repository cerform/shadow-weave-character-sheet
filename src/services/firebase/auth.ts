
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { app } from './config';
import { logAuthError, DetailedAuthError } from './error-utils';

// Initialize Firebase Auth
export const firebaseAuth = getAuth(app);

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

  // Вход через Google - исправленная версия для устранения проблемы с null-ответом
  loginWithGoogle: async (): Promise<FirebaseUser | null> => {
    try {
      console.log("[AUTH] Начинаем вход через Google");
      
      // Проверяем доступность домена для Firebase Auth
      console.log("[AUTH] Текущий домен:", window.location.origin);
      
      // Создаем новый экземпляр провайдера при каждом вызове
      const provider = new GoogleAuthProvider();
      
      // Настраиваем параметры для показа окна выбора аккаунта
      provider.setCustomParameters({
        prompt: 'select_account',
        hl: 'ru' // Русский язык интерфейса
      });
      
      // Добавляем области доступа для получения профиля пользователя
      provider.addScope('profile');
      provider.addScope('email');
      
      console.log("[AUTH] Google провайдер создан с параметрами:", {
        prompt: 'select_account',
        hl: 'ru'
      });
      
      // Проверка состояния браузера перед открытием всплывающего окна
      const browserFeatures = {
        localStorage: !!window.localStorage,
        sessionStorage: !!window.sessionStorage,
        cookies: navigator.cookieEnabled,
        popupSupport: typeof window.open === 'function',
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      };
      
      console.log("[AUTH] Состояние браузера:", browserFeatures);
      
      // Тест возможности открытия popup
      let popupSupported = false;
      try {
        const testPopup = window.open('about:blank', '_blank', 'width=100,height=100');
        if (testPopup) {
          testPopup.close();
          popupSupported = true;
          console.log("[AUTH] Тест popup успешен");
        } else {
          console.warn("[AUTH] Тест popup неудачен - popup блокирован");
        }
      } catch (e) {
        console.error("[AUTH] Ошибка при тесте popup:", e);
      }
      
      if (!popupSupported) {
        console.error("[AUTH] Всплывающие окна заблокированы. Аутентификация через popup не возможна");
        throw new Error("Всплывающие окна заблокированы. Разрешите всплывающие окна для этого сайта и попробуйте снова.");
      }
      
      // Принудительно очищаем персистентное хранилище для исключения конфликтов
      await setPersistence(firebaseAuth, browserLocalPersistence);
      
      console.log("[AUTH] Устанавливаем персистентность:", "browserLocalPersistence");
      
      // Используем signInWithPopup с новым провайдером и обработкой ошибок
      console.log("[AUTH] Вызываем signInWithPopup...");
      
      try {
        const result = await signInWithPopup(firebaseAuth, provider);
        
        // Проверяем, что результат не пустой
        if (!result || !result.user) {
          console.error("[AUTH] signInWithPopup вернул пустой результат");
          throw new Error("Сервер вернул пустой ответ при аутентификации через Google.");
        }
        
        console.log("[AUTH] Google login успешен:", result.user.uid);
        return result.user;
      } catch (popupError: any) {
        console.error("[AUTH] Ошибка в signInWithPopup:", popupError);
        
        // Более детальная обработка конкретных ошибок popup
        if (popupError.code === 'auth/popup-blocked') {
          throw new Error("Всплывающее окно для авторизации было заблокировано браузером. Пожалуйста, разрешите всплывающие окна для этого сайта и попробуйте снова.");
        }
        
        if (popupError.code === 'auth/popup-closed-by-user') {
          throw new Error("Окно авторизации было закрыто до завершения процесса. Пожалуйста, не закрывайте окно авторизации Google до завершения входа.");
        }
        
        if (popupError.code === 'auth/cancelled-popup-request') {
          throw new Error("Запрос на открытие окна авторизации был отменен. Пожалуйста, повторите попытку через несколько секунд.");
        }
        
        // Общая обработка других ошибок
        throw popupError;
      }
    } catch (error: any) {
      const detailedError = logAuthError('Вход через Google', error);
      
      // Вывод дополнительной отладочной информации
      console.error('[AUTH] Расширенная информация об ошибке:', {
        errorCode: error.code || 'unknown',
        errorMessage: error.message,
        browser: navigator.userAgent,
        domain: window.location.origin,
        time: new Date().toISOString()
      });
      
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

export { auth };
