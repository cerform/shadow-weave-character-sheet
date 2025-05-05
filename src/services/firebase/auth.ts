
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
  browserLocalPersistence,
  browserSessionPersistence
} from 'firebase/auth';
import { app } from './config';
import { logAuthError, DetailedAuthError } from './error-utils';

// Initialize Firebase Auth
export const firebaseAuth = getAuth(app);

// Установка постоянной сессии для аутентификации
setPersistence(firebaseAuth, browserLocalPersistence)
  .then(() => {
    console.log('[AUTH] Установлена постоянная сессия для аутентификации');
  })
  .catch((error) => {
    console.error('[AUTH] Ошибка при установке persistence:', error);
  });

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

  // Вход через Google - улучшенная версия
  loginWithGoogle: async (): Promise<FirebaseUser | null> => {
    try {
      console.log("[AUTH] Начинаем вход через Google");
      
      // Создаем новый экземпляр провайдера для каждого вызова
      const provider = new GoogleAuthProvider();
      
      // Настраиваем параметры
      provider.setCustomParameters({
        prompt: 'select_account',
        hl: 'ru'
      });
      
      // Добавляем необходимые области доступа
      provider.addScope('profile');
      provider.addScope('email');
      
      console.log("[AUTH] Google провайдер создан и настроен");
      
      // Используем signInWithPopup с принудительным фокусом
      const result = await signInWithPopup(firebaseAuth, provider);
      
      if (result && result.user) {
        console.log("[AUTH] Google login успешен:", result.user.uid);
        return result.user;
      } else {
        console.error("[AUTH] Google auth вернул пустой результат");
        throw new Error("Получен пустой результат аутентификации");
      }
    } catch (error: any) {
      console.error("[AUTH] Ошибка при входе через Google:", error);
      
      // Улучшенное определение ошибок
      if (error.code === 'auth/popup-closed-by-user') {
        const customError = new Error("Окно авторизации было закрыто. Пожалуйста, попробуйте снова.") as DetailedAuthError;
        customError.code = error.code;
        customError.fullDetails = { environment: { userAgent: navigator.userAgent } };
        throw customError;
      }
      
      if (error.code === 'auth/popup-blocked') {
        const customError = new Error("Браузер заблокировал всплывающее окно. Пожалуйста, разрешите всплывающие окна для этого сайта.") as DetailedAuthError;
        customError.code = error.code;
        customError.fullDetails = { environment: { userAgent: navigator.userAgent } };
        throw customError;
      }
      
      const detailedError = logAuthError('Вход через Google', error);
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
