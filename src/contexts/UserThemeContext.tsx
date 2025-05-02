
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSessionStore } from '../stores/sessionStore';
import { useTheme } from '@/hooks/use-theme';
import { Theme } from './ThemeContext';

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
      // Преобразуем строковую тему в тип Theme
      setTheme(currentUser.themePreference as Theme);
    }
  }, [currentUser?.id, currentUser?.themePreference, setTheme]);
  
  // Функция для изменения темы пользователя
  const setUserTheme = (theme: string) => {
    if (currentUser) {
      updateUserTheme(currentUser.id, theme);
      // Преобразуем строковую тему в тип Theme
      setTheme(theme as Theme);
    } else {
      // Если пользователь не в системе, просто меняем тему
      setTheme(theme as Theme);
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
