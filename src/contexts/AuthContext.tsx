
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '@/services/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';

interface AuthContextProps {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName: string) => Promise<void>;
  updateProfile: (data: { displayName?: string, photoURL?: string }) => Promise<void>; // Added for ProfilePage
  isAuthenticated: boolean;
  isLoading: boolean;
  googleLogin?: () => Promise<void>; // Опционально, возможно будет добавлено позже
}

// Экспортируем AuthContext для использования в useAuth
export const AuthContext = createContext<AuthContextProps | null>(null);

// Создаем хук useAuth для удобства использования контекста
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    console.error('useAuth должен использоваться внутри AuthProvider');
    
    // Возвращаем заглушку с базовыми данными, чтобы избежать ошибок при использовании
    return {
      currentUser: null,
      isAuthenticated: false,
      isLoading: false,
      login: () => Promise.reject('AuthProvider не найден'),
      logout: () => Promise.reject('AuthProvider не найден'),
      register: () => Promise.reject('AuthProvider не найден'),
      resetPassword: () => Promise.reject('AuthProvider не найден'),
      updateUserProfile: () => Promise.reject('AuthProvider не найден'),
      updateProfile: () => Promise.reject('AuthProvider не найден'),
      googleLogin: () => Promise.reject('AuthProvider не найден')
    };
  }
  
  return context;
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth as any, (user) => {
      setCurrentUser(user);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      await signInWithEmailAndPassword(auth as any, email, password);
    } catch (error) {
      console.error('Ошибка при входе:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string): Promise<void> => {
    try {
      await createUserWithEmailAndPassword(auth as any, email, password);
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth as any);
    } catch (error) {
      console.error('Ошибка при выходе:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth as any, email);
    } catch (error) {
      console.error('Ошибка при сбросе пароля:', error);
      throw error;
    }
  };

  const updateUserProfile = async (displayName: string): Promise<void> => {
    try {
      if (currentUser) {
        await updateProfile(currentUser, { displayName });
      }
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
      throw error;
    }
  };

  // Добавляем метод updateProfile для совместимости с ProfilePage
  const updateProfileMethod = async (data: { displayName?: string, photoURL?: string }): Promise<void> => {
    try {
      if (currentUser) {
        await updateProfile(currentUser, data);
      }
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
      throw error;
    }
  };

  const value: AuthContextProps = {
    currentUser,
    login,
    register,
    logout,
    resetPassword,
    updateUserProfile,
    updateProfile: updateProfileMethod,
    isAuthenticated: !!currentUser,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export { AuthProvider };
