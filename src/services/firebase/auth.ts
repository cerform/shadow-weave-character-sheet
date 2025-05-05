
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

  // Вход через Google - улучшенная и исправленная версия
  loginWithGoogle: async (): Promise<FirebaseUser | null> => {
    try {
      console.log("[AUTH] Начинаем вход через Google");
      
      // Устанавливаем персистентность перед авторизацией
      await setPersistence(firebaseAuth, browserLocalPersistence);
      console.log("[AUTH] Установлена персистентность браузера");
      
      // Создаем новый экземпляр провайдера для каждого вызова
      const provider = new GoogleAuthProvider();
      
      // Настраиваем параметры для более надежного открытия окна
      provider.setCustomParameters({
        prompt: 'select_account',
        hl: 'ru' // Русский язык интерфейса
      });
      
      // Добавляем необходимые области доступа
      provider.addScope('profile');
      provider.addScope('email');
      
      console.log("[AUTH] Google провайдер создан и настроен");
      
      // Тест возможности открытия popup перед авторизацией
      try {
        const testPopup = window.open('about:blank', '_blank', 'width=100,height=100');
        if (testPopup) {
          testPopup.close();
          console.log("[AUTH] Тест popup успешен");
        } else {
          console.warn("[AUTH] Всплывающие окна заблокированы");
          throw new Error("Всплывающие окна заблокированы. Разрешите всплывающие окна для этого сайта и попробуйте снова.");
        }
      } catch (e) {
        console.error("[AUTH] Ошибка при тесте popup:", e);
        throw new Error("Проблема с открытием всплывающих окон. Проверьте настройки браузера.");
      }
      
      // Используем signInWithPopup с обработкой ошибок
      console.log("[AUTH] Вызываем signInWithPopup...");
      
      try {
        const result = await signInWithPopup(firebaseAuth, provider);
        
        // Проверяем результат
        if (!result || !result.user) {
          console.error("[AUTH] signInWithPopup вернул пустой результат");
          throw new Error("Сервер вернул пустой ответ при аутентификации через Google.");
        }
        
        console.log("[AUTH] Google login успешен:", result.user.uid);
        return result.user;
      } catch (popupError: any) {
        console.error("[AUTH] Ошибка в signInWithPopup:", popupError);
        
        // Более детальная обработка ошибок popup
        if (popupError.code === 'auth/popup-blocked') {
          throw new Error("Всплывающее окно для авторизации было заблокировано браузером. Пожалуйста, разрешите всплывающие окна для этого сайта и попробуйте снова.");
        }
        
        if (popupError.code === 'auth/popup-closed-by-user') {
          throw new Error("Окно авторизации было закрыто до завершения процесса. Пожалуйста, не закрывайте окно авторизации Google до завершения входа.");
        }
        
        if (popupError.code === 'auth/cancelled-popup-request') {
          throw new Error("Запрос на открытие окна авторизации был отменен. Пожалуйста, повторите попытку через несколько секунд.");
        }
        
        throw popupError;
      }
    } catch (error: any) {
      const detailedError = logAuthError('Вход через Google', error);
      
      // Расширенный лог для отладки
      console.error('[AUTH] Подробности ошибки Google входа:', {
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
