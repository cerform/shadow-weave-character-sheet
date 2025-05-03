
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, User as FirebaseUser } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { toast } from "sonner";

// Firebase конфигурация
const firebaseConfig = {
  apiKey: "AIzaSyAeKvsN-wul7CsemTA-cFxZI0iO9sWe0fg",
  authDomain: "shadow-char.firebaseapp.com",
  projectId: "shadow-char",
  storageBucket: "shadow-char.appspot.com",
  messagingSenderId: "815261687102",
  appId: "1:815261687102:web:5497647ed6ff449a57e06f",
  measurementId: "G-KQ3M1GQJX2"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Добавляем дополнительные параметры для Google Auth
googleProvider.setCustomParameters({ 
  prompt: 'select_account' 
});

// Инициализация Firebase Analytics
const analytics = getAnalytics(app);

// Сервис для работы с аутентификацией
export const firebaseAuthService = {
  // Регистрация с email и паролем
  registerWithEmail: async (email: string, password: string): Promise<FirebaseUser | null> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      toast.success("Регистрация выполнена успешно!");
      return userCredential.user;
    } catch (error: any) {
      let message = "Ошибка при регистрации";
      if (error.code === 'auth/email-already-in-use') {
        message = "Этот email уже используется";
      } else if (error.code === 'auth/weak-password') {
        message = "Пароль слишком простой";
      } else if (error.code === 'auth/invalid-email') {
        message = "Некорректный email";
      }
      toast.error(message);
      throw error;
    }
  },

  // Вход с email и паролем
  loginWithEmail: async (email: string, password: string): Promise<FirebaseUser | null> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      toast.success("Вход выполнен успешно!");
      return userCredential.user;
    } catch (error: any) {
      let message = "Ошибка при входе";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        message = "Неверный email или пароль";
      } else if (error.code === 'auth/too-many-requests') {
        message = "Слишком много попыток входа. Попробуйте позже";
      }
      toast.error(message);
      throw error;
    }
  },

  // Вход через Google
  loginWithGoogle: async (): Promise<FirebaseUser | null> => {
    try {
      console.log("Начинаем вход через Google...");
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Успешный вход через Google:", result);
      toast.success("Вход через Google выполнен успешно!");
      return result.user;
    } catch (error: any) {
      console.error("Детальная информация об ошибке:", error);
      let message = "Ошибка при входе через Google";
      if (error.code === 'auth/configuration-not-found') {
        message = "Ошибка конфигурации Firebase. Пожалуйста, попробуйте позже или используйте другой метод входа";
      } else if (error.code === 'auth/popup-closed-by-user') {
        message = "Окно авторизации было закрыто. Попробуйте еще раз.";
      }
      toast.error(message);
      throw error;
    }
  },

  // Выход из аккаунта
  logout: async (): Promise<void> => {
    try {
      await signOut(auth);
      toast.success("Выход выполнен успешно");
    } catch (error) {
      toast.error("Ошибка при выходе из аккаунта");
      throw error;
    }
  },

  // Текущий пользователь
  getCurrentUser: (): FirebaseUser | null => {
    return auth.currentUser;
  },

  // Слушатель изменения состояния аутентификации
  onAuthStateChanged: (callback: (user: FirebaseUser | null) => void) => {
    return onAuthStateChanged(auth, callback);
  }
};

export { auth, analytics };
