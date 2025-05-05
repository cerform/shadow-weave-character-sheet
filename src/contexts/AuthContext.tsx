
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserType, AuthContextType } from '@/types/auth';
import { auth as firebaseAuth } from '@/services/firebase';
import { User as FirebaseUser } from 'firebase/auth';

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
const transformUser = (firebaseUser: FirebaseUser): UserType => {
  return {
    id: firebaseUser.uid,
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: firebaseUser.displayName || undefined,
    photoURL: firebaseUser.photoURL || undefined,
    username: firebaseUser.displayName || undefined,
    isDM: false, // По умолчанию пользователь не DM
  };
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Настройка слушателя изменения состояния аутентификации
    const unsubscribe = firebaseAuth.onAuthStateChanged((authUser) => {
      try {
        if (authUser) {
          // Пользователь авторизован
          const transformedUser = transformUser(authUser);
          setUser(transformedUser);
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
        const transformedUser = transformUser(userCredential);
        setUser(transformedUser);
      }
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, displayName: string) => {
    try {
      setLoading(true);
      const userCredential = await firebaseAuth.registerWithEmail(email, password);
      if (userCredential) {
        // Здесь можно добавить обновление displayName пользователя,
        // когда будет реализована соответствующая функция в Firebase
        const transformedUser = transformUser(userCredential);
        transformedUser.displayName = displayName;
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
        const transformedUser = transformUser(userCredential);
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
      
      // Здесь должна быть логика обновления профиля в Firebase
      // Пока просто обновляем локальное состояние
      const updatedUser = { ...user, ...data };
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
