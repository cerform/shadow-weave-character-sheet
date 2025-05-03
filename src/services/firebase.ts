
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
import { getAnalytics } from "firebase/analytics";

// Конфигурация Firebase
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAeKvsN-wul7CsemTA-cFxZI0iO9sWe0fg",
  authDomain: "shadow-char.firebaseapp.com",
  projectId: "shadow-char",
  storageBucket: "shadow-char.appspot.com", // Правильный URL хранилища
  messagingSenderId: "815261687102",
  appId: "1:815261687102:web:5497647ed6ff449a57e06f",
  measurementId: "G-KQ3M1GQJX2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const firebaseAuth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Провайдеры аутентификации
const googleProvider = new GoogleAuthProvider();

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
      console.error('Ошибка при регистрации:', error.message);
      throw error;
    }
  },

  // Вход с Email и паролем
  loginWithEmail: async (email: string, password: string): Promise<FirebaseUser | null> => {
    try {
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      return userCredential.user;
    } catch (error: any) {
      console.error('Ошибка при входе:', error.message);
      throw error;
    }
  },

  // Вход через Google
  loginWithGoogle: async (): Promise<FirebaseUser | null> => {
    try {
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      return result.user;
    } catch (error: any) {
      console.error('Ошибка при входе через Google:', error.message);
      throw error;
    }
  },

  // Выход из системы
  logout: async (): Promise<void> => {
    try {
      await signOut(firebaseAuth);
    } catch (error: any) {
      console.error('Ошибка при выходе:', error.message);
      throw error;
    }
  },

  // Слушатель изменения состояния аутентификации
  onAuthStateChanged: (callback: (user: FirebaseUser | null) => void) => {
    return onAuthStateChanged(firebaseAuth, callback);
  }
};

export { app, db, storage, auth, firebaseAuth };
