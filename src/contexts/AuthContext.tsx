
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
  isAuthenticated: boolean;
  isLoading: boolean;
  googleLogin?: () => Promise<void>; // Опционально, возможно будет добавлено позже
}

// Экспортируем AuthContext для использования в useAuth
export const AuthContext = createContext<AuthContextProps | null>(null);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Ошибка при входе:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string): Promise<void> => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Ошибка при выходе:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
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

  const value: AuthContextProps = {
    currentUser,
    login,
    register,
    logout,
    resetPassword,
    updateUserProfile,
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

// Удаляем экспорт useAuth отсюда, так как он будет в отдельном файле
