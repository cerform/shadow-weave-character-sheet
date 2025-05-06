
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { app } from '@/firebase';
import { logAuthError } from './error-utils';

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

// Создание провайдера Google
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
  hl: 'ru'
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

  // Вход через Google с поддержкой redirect при ошибке popup
  loginWithGoogle: async (): Promise<FirebaseUser | null> => {
    try {
      console.log("[AUTH] Начинаем вход через Google с popup");
      
      try {
        // Сначала пытаемся использовать popup
        const popupResult = await signInWithPopup(firebaseAuth, googleProvider);
        console.log("[AUTH] Google popup успешен:", popupResult.user?.uid);
        return popupResult.user;
      } catch (popupError: any) {
        // Если popup заблокирован или возникла ошибка
        console.warn("[AUTH] Popup заблокирован или возникла ошибка, пробуем redirect:", popupError);
        
        // Перенаправляем на страницу аутентификации Google
        console.log("[AUTH] Переключаемся на метод redirect");
        await signInWithRedirect(firebaseAuth, googleProvider);
        // Здесь управление не вернется, так как произойдет редирект
        return null;
      }
    } catch (error: any) {
      console.error("[AUTH] Общая ошибка при входе через Google:", error);
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
