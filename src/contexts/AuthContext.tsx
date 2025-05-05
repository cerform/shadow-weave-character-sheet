
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserType, AuthContextType } from '@/types/auth';
import { auth as firebaseAuth } from '@/services/firebase';
import { User as FirebaseUser } from 'firebase/auth';
import { db } from '@/services/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const defaultAuthContext: AuthContextType = {
  user: null,
  currentUser: null,
  loading: true,
  error: null,
  login: async () => {},
  signup: async () => {},
  register: async () => {},
  logout: async () => {},
  googleLogin: async () => {},
  isAuthenticated: false,
  updateProfile: async () => {}
};

export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

// Функция преобразования пользователя Firebase в UserType
const transformUser = (firebaseUser: FirebaseUser, extraData: Partial<UserType> = {}): UserType => {
  return {
    id: firebaseUser.uid,
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: firebaseUser.displayName || undefined,
    photoURL: firebaseUser.photoURL || undefined,
    username: firebaseUser.displayName || undefined,
    isDM: extraData.isDM || false, // Используем переданное значение или false по умолчанию
  };
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Функция для сохранения информации о пользователе в Firestore
  const saveUserToFirestore = async (user: UserType) => {
    try {
      const userRef = doc(db, "users", user.id);
      
      // Проверим, существует ли этот пользователь
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        // Обновляем существующего пользователя
        await setDoc(userRef, {
          username: user.username || user.displayName || '',
          email: user.email,
          updatedAt: new Date().toISOString(),
          isDM: user.isDM || false,
          // Сохраняем другие поля, но не перезаписываем их
        }, { merge: true });
      } else {
        // Создаем нового пользователя
        await setDoc(userRef, {
          username: user.username || user.displayName || '',
          email: user.email,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isDM: user.isDM || false,
          characters: [],
        });
      }
    } catch (error) {
      console.error("Ошибка при сохранении пользователя в Firestore:", error);
    }
  };

  // Функция для получения расширенных данных пользователя из Firestore
  const getUserFromFirestore = async (userId: string): Promise<Partial<UserType>> => {
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return userSnap.data() as Partial<UserType>;
      }
      
      return {};
    } catch (error) {
      console.error("Ошибка при получении пользователя из Firestore:", error);
      return {};
    }
  };

  useEffect(() => {
    // Настройка слушателя изменения состояния аутентификации
    const unsubscribe = firebaseAuth.onAuthStateChanged(async (authUser) => {
      try {
        if (authUser) {
          // Пользователь авторизован
          // Получаем дополнительные данные из Firestore
          const userData = await getUserFromFirestore(authUser.uid);
          const transformedUser = transformUser(authUser, userData);
          setUser(transformedUser);
          // Сохраняем пользователя в Firestore (создаем или обновляем)
          await saveUserToFirestore(transformedUser);
        } else {
          // Пользователь не авторизован
          setUser(null);
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    });

    // Очистка слушателя при размонтировании
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const userCredential = await firebaseAuth.loginWithEmail(email, password);
      if (userCredential) {
        // Получаем дополнительные данные из Firestore
        const userData = await getUserFromFirestore(userCredential.uid);
        const transformedUser = transformUser(userCredential, userData);
        setUser(transformedUser);
      }
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, displayName: string, isDM: boolean = false) => {
    try {
      setLoading(true);
      const userCredential = await firebaseAuth.registerWithEmail(email, password);
      if (userCredential) {
        // Создаем объект пользователя с дополнительными данными
        const transformedUser = transformUser(userCredential, { isDM, displayName });
        transformedUser.displayName = displayName;
        transformedUser.isDM = isDM;
        
        // Сохраняем пользователя в Firestore
        await saveUserToFirestore(transformedUser);
        
        setUser(transformedUser);
      }
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Алиас для signup, чтобы соответствовать ожидаемому имени функции
  const register = signup;

  const logout = async () => {
    try {
      setLoading(true);
      await firebaseAuth.logout();
      setUser(null);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Добавляем функцию для входа через Google
  const googleLogin = async (redirect: boolean = true) => {
    try {
      setLoading(true);
      const userCredential = await firebaseAuth.loginWithGoogle();
      if (userCredential) {
        // Получаем дополнительные данные из Firestore
        const userData = await getUserFromFirestore(userCredential.uid);
        const transformedUser = transformUser(userCredential, userData);
        
        // Сохраняем пользователя в Firestore для обновления или создания
        await saveUserToFirestore(transformedUser);
        
        setUser(transformedUser);
      }
    } catch (err) {
      console.error("Google login error:", err);
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Добавляем функцию обновления профиля
  const updateProfile = async (data: Partial<UserType>) => {
    try {
      if (!user) throw new Error('Пользователь не авторизован');
      
      // Обновляем профиль в Firestore
      const updatedUser = { ...user, ...data };
      await saveUserToFirestore(updatedUser);
      setUser(updatedUser);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentUser: user,
        loading,
        error: error ? error.message : null,
        login,
        register,
        logout,
        googleLogin,
        isAuthenticated: !!user,
        updateProfile,
        signup
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
