
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSessionStore } from '../stores/sessionStore';
import { Theme, useTheme } from '@/contexts/ThemeContext';

interface UserThemeContextType {
  setUserTheme: (theme: string) => void;
  activeTheme: string;
}

const UserThemeContext = createContext<UserThemeContextType | undefined>(undefined);

export const UserThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, updateUserTheme } = useSessionStore();
  const { setTheme } = useTheme();
  const [activeTheme, setActiveTheme] = useState(() => {
    // При монтировании проверяем сохраненную тему в localStorage
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'default';
  });
  
  // Применяем тему при монтировании и при изменении текущего пользователя
  useEffect(() => {
    // Применяем базовую тему из localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      applyThemeToDocument(savedTheme);
      setActiveTheme(savedTheme);
      setTheme(savedTheme as Theme);
    }
    
    // Если есть пользовательская тема, применяем ее
    if (currentUser?.themePreference) {
      applyThemeToDocument(currentUser.themePreference);
      setActiveTheme(currentUser.themePreference);
      setTheme(currentUser.themePreference as Theme);
    }
  }, [currentUser?.id, currentUser?.themePreference, setTheme]);
  
  // Функция для применения темы к документу
  const applyThemeToDocument = (theme: string) => {
    // Удаляем все классы тем
    document.body.classList.forEach(className => {
      if (className.startsWith('theme-')) {
        document.body.classList.remove(className);
      }
    });
    
    // Применяем новую тему
    document.body.classList.add(`theme-${theme}`);
    document.documentElement.setAttribute('data-theme', theme);
  };
  
  // Функция для изменения темы пользователя
  const setUserTheme = (theme: string) => {
    // Применяем тему
    applyThemeToDocument(theme);
    
    // Сохраняем новую тему
    setActiveTheme(theme);
    localStorage.setItem('theme', theme);
    setTheme(theme as Theme);
    
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
