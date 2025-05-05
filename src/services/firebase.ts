
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

// Провайдеры аутентификации
const googleProvider = new GoogleAuthProvider();

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
    'auth/popup-blocked': 'Всплывающее окно авторизации заблокировано браузером.'
  };
  
  // Возвращаем соответствующее сообщение для кода ошибки или стандартное сообщение
  return errorMessages[errorCode] || error.message || 'Произошла неизвестная ошибка при аутентификации.';
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
      const formattedError = { ...error, message: formatFirebaseError(error) };
      console.error('Ошибка при регистрации:', formattedError.message);
      throw formattedError;
    }
  },

  // Вход с Email и паролем
  loginWithEmail: async (email: string, password: string): Promise<FirebaseUser | null> => {
    try {
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      return userCredential.user;
    } catch (error: any) {
      const formattedError = { ...error, message: formatFirebaseError(error) };
      console.error('Ошибка при входе:', formattedError.message);
      throw formattedError;
    }
  },

  // Вход через Google
  loginWithGoogle: async (): Promise<FirebaseUser | null> => {
    try {
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      return result.user;
    } catch (error: any) {
      const formattedError = { ...error, message: formatFirebaseError(error) };
      console.error('Ошибка при входе через Google:', formattedError);
      throw formattedError;
    }
  },

  // Выход из системы
  logout: async (): Promise<void> => {
    try {
      await signOut(firebaseAuth);
    } catch (error: any) {
      const formattedError = { ...error, message: formatFirebaseError(error) };
      console.error('Ошибка при выходе:', formattedError.message);
      throw formattedError;
    }
  },

  // Слушатель изменения состояния аутентификации
  onAuthStateChanged: (callback: (user: FirebaseUser | null) => void) => {
    return onAuthStateChanged(firebaseAuth, callback);
  }
};

export { app, db, storage, auth, firebaseAuth, analyticsPromise };
