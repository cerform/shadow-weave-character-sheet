
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAeKvsN-wul7CsemTA-cFxZI0iO9sWe0fg",
  authDomain: "shadow-char.firebaseapp.com",
  projectId: "shadow-char",
  storageBucket: "shadow-char.appspot.com", // Исправлено имя бакета
  messagingSenderId: "815261687102",
  appId: "1:815261687102:web:5497647ed6ff449a57e06f",
  measurementId: "G-KQ3M1GQJX2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
let analytics;

// Инициализируем аналитику только в браузере, а не при SSR
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Firebase Auth Service
const firebaseAuth = {
  registerWithEmail: async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error("Ошибка при регистрации:", error);
      throw error;
    }
  },

  loginWithEmail: async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error("Ошибка при авторизации:", error);
      throw error;
    }
  },

  loginWithGoogle: async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error) {
      console.error("Ошибка при входе через Google:", error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Ошибка при выходе:", error);
      throw error;
    }
  },

  onAuthStateChanged: (callback: any) => {
    return onAuthStateChanged(auth, callback);
  },

  getCurrentUser: () => {
    return auth.currentUser;
  }
};

export { auth, db, storage, firebaseAuth, analytics };
