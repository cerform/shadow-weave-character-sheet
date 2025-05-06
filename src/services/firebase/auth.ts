
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
export const auth = getAuth(app);
// Export auth as firebaseAuth for backward compatibility
export const firebaseAuth = auth;

// Установка постоянной сессии для аутентификации
setPersistence(auth, browserLocalPersistence)
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
export const loginWithEmail = async (email: string, password: string): Promise<FirebaseUser | null> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    const detailedError = logAuthError('Вход по email', error);
    throw detailedError;
  }
};

export const registerWithEmail = async (email: string, password: string): Promise<FirebaseUser | null> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    const detailedError = logAuthError('Регистрация по email', error);
    throw detailedError;
  }
};

export const loginWithGoogle = async (): Promise<FirebaseUser | null> => {
  try {
    console.log("[AUTH] Начинаем вход через Google с popup");
    
    try {
      // Сначала пытаемся использовать popup
      const popupResult = await signInWithPopup(auth, googleProvider);
      console.log("[AUTH] Google popup успешен:", popupResult.user?.uid);
      return popupResult.user;
    } catch (popupError: any) {
      // Если popup заблокирован или возникла ошибка
      console.warn("[AUTH] Popup заблокирован или возникла ошибка, пробуем redirect:", popupError);
      
      // Перенаправляем на страницу аутентификации Google
      console.log("[AUTH] Переключаемся на метод redirect");
      await signInWithRedirect(auth, googleProvider);
      // Здесь управление не вернется, так как произойдет редирект
      return null;
    }
  } catch (error: any) {
    console.error("[AUTH] Общая ошибка при входе через Google:", error);
    const detailedError = logAuthError('Вход через Google', error);
    throw detailedError;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    const detailedError = logAuthError('Выход из системы', error);
    throw detailedError;
  }
};

export const listenToAuthChanges = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
