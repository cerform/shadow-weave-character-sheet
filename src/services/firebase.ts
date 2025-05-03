
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDf33BOy-8BIgOJFQ-IbhvX2IOi1p5b8r4",
  authDomain: "shadow-char.firebaseapp.com",
  projectId: "shadow-char",
  storageBucket: "shadow-char.appspot.com",
  messagingSenderId: "855663723625",
  appId: "1:855663723625:web:2157acfa14c97dd7d22b0e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

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

export { auth, db, storage, firebaseAuth };
