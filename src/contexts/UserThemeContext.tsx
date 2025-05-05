
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSessionStore } from '../stores/sessionStore';
import { Theme, useTheme } from '@/contexts/ThemeContext';
import { themes } from '@/lib/themes';

interface UserThemeContextType {
  setUserTheme: (theme: string) => void;
  activeTheme: string;
  currentThemeStyles: any; // Добавляем текущие стили темы
}

export const UserThemeContext = createContext<UserThemeContextType | undefined>(undefined);

export const UserThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, updateUserTheme } = useSessionStore();
  const { setTheme } = useTheme();
  const [activeTheme, setActiveTheme] = useState<string>(() => {
    // При монтировании проверяем сохраненную тему в localStorage
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'default';
  });
  
  // Получаем актуальные стили для текущей темы
  const themeKey = activeTheme as keyof typeof themes;
  const currentThemeStyles = themes[themeKey] || themes.default;
  
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
    console.log('Применяем тему:', theme);
    
    // Удаляем все классы тем
    document.body.classList.forEach(className => {
      if (className.startsWith('theme-')) {
        document.body.classList.remove(className);
      }
    });
    
    // Применяем новую тему
    document.body.classList.add(`theme-${theme}`);
    document.documentElement.setAttribute('data-theme', theme);
    
    // Получаем стили для выбранной темы
    const themeKey = theme as keyof typeof themes;
    const themeStyles = themes[themeKey] || themes.default;
    
    // Применяем CSS переменные к корневому элементу для более гибкой стилизации
    document.documentElement.style.setProperty('--theme-accent', themeStyles.accent);
    document.documentElement.style.setProperty('--theme-glow', themeStyles.glow);
    document.documentElement.style.setProperty('--theme-text-color', themeStyles.textColor);
    document.documentElement.style.setProperty('--theme-muted-text-color', themeStyles.mutedTextColor);
    document.documentElement.style.setProperty('--theme-card-background', themeStyles.cardBackground);
    document.documentElement.style.setProperty('--theme-button-text', themeStyles.buttonText);
    document.documentElement.style.setProperty('--theme-button-background', themeStyles.buttonBackground);
    
    // Устанавливаем цвет текста для лучшей видимости в зависимости от темы
    document.documentElement.style.setProperty('--text-color', themeStyles.textColor || '#FFFFFF');
    document.documentElement.style.setProperty('--muted-text-color', themeStyles.mutedTextColor || '#DDDDDD');
  };
  
  // Функция для изменения темы пользователя
  const setUserTheme = (theme: string) => {
    console.log('Переключаем на тему:', theme);
    
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
    <UserThemeContext.Provider value={{ setUserTheme, activeTheme, currentThemeStyles }}>
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
