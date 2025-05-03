
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

// Конфигурация Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD-WGomcu2ij_ZKj4T-Puat49rU5UfZL8c",
  authDomain: "d-d-helper-e026b.firebaseapp.com",
  projectId: "d-d-helper-e026b",
  storageBucket: "d-d-helper-e026b.appspot.com",
  messagingSenderId: "248538482463",
  appId: "1:248538482463:web:c40c9ea55f87fcafb8c108"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
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
