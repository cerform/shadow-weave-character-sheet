
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSessionStore } from '../stores/sessionStore';
import { useTheme } from '@/hooks/use-theme';

interface UserThemeContextType {
  setUserTheme: (theme: string) => void;
}

const UserThemeContext = createContext<UserThemeContextType | undefined>(undefined);

export const UserThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, updateUserTheme } = useSessionStore();
  const { setTheme } = useTheme();
  
  // При изменении текущего пользователя, применяем его тему
  useEffect(() => {
    if (currentUser?.themePreference) {
      setTheme(currentUser.themePreference);
    }
  }, [currentUser?.id, currentUser?.themePreference, setTheme]);
  
  // Функция для изменения темы пользователя
  const setUserTheme = (theme: string) => {
    if (currentUser) {
      updateUserTheme(currentUser.id, theme);
      setTheme(theme);
    } else {
      // Если пользователь не в системе, просто меняем тему
      setTheme(theme);
    }
  };
  
  return (
    <UserThemeContext.Provider value={{ setUserTheme }}>
      {children}
    </UserThemeContext.Provider>
  );
};

export const useUserTheme = (): UserThemeContextType => {
  const context = useContext(UserThemeContext);
  if (context === undefined) {
    throw new Error('useUserTheme must be used within a UserThemeProvider');
  }
  return context;
};
