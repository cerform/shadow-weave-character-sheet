
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSessionStore } from '../stores/sessionStore';
import { Theme } from './ThemeContext';

interface UserThemeContextType {
  setUserTheme: (theme: string) => void;
  activeTheme: string;
}

const UserThemeContext = createContext<UserThemeContextType | undefined>(undefined);

export const UserThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, updateUserTheme } = useSessionStore();
  const [activeTheme, setActiveTheme] = useState('default');
  
  useEffect(() => {
    // При монтировании проверяем сохраненную тему в localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setActiveTheme(savedTheme);
      // Применяем тему к документу
      document.documentElement.setAttribute('data-theme', savedTheme);
      document.body.classList.add(`theme-${savedTheme}`);
    }
    
    // Если есть пользовательская тема, применяем ее
    if (currentUser?.themePreference) {
      setActiveTheme(currentUser.themePreference);
      // Применяем тему к документу
      document.documentElement.setAttribute('data-theme', currentUser.themePreference);
      document.body.classList.add(`theme-${currentUser.themePreference}`);
    }
  }, [currentUser?.id, currentUser?.themePreference]);
  
  // Функция для изменения темы пользователя
  const setUserTheme = (theme: string) => {
    // Удаляем старые классы тем
    document.body.classList.remove(`theme-${activeTheme}`);
    
    // Применяем новую тему
    document.body.classList.add(`theme-${theme}`);
    document.documentElement.setAttribute('data-theme', theme);
    
    // Сохраняем новую тему
    setActiveTheme(theme);
    localStorage.setItem('theme', theme);
    
    // Если пользователь авторизован, сохраняем также в его профиле
    if (currentUser) {
      updateUserTheme(currentUser.id, theme);
    }
  };
  
  return (
    <UserThemeContext.Provider value={{ setUserTheme, activeTheme }}>
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
