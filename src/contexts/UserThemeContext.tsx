
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Theme, themes } from '../lib/themes';
import useSessionStore from "../stores/sessionStore";

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
  themeStyles: Theme;
  currentTheme: Theme;
  activeTheme: string; // Добавляем активную тему для совместимости с useUserTheme
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'default',
  setTheme: () => {},
  themeStyles: themes.default,
  currentTheme: themes.default,
  activeTheme: 'default'
});

export const ThemeProvider = ({ children }: {children: React.ReactNode}) => {
  const [theme, setTheme] = useState<string>(() => {
    // Загружаем тему из localStorage или используем тему по умолчанию
    try {
      const savedTheme = localStorage.getItem('dnd-theme') || 'default';
      return savedTheme;
    } catch (error) {
      console.error('Ошибка при загрузке темы:', error);
      return 'default';
    }
  });
  
  // Получаем объект темы
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  const themeStyles = currentTheme; // Добавляем для совместимости
  
  // Сохраняем выбранную тему в localStorage при изменении
  useEffect(() => {
    try {
      localStorage.setItem('dnd-theme', theme);
      
      // Устанавливаем CSS-переменные для темы
      document.documentElement.style.setProperty('--background', currentTheme.background);
      document.documentElement.style.setProperty('--foreground', currentTheme.foreground);
      document.documentElement.style.setProperty('--primary', currentTheme.primary);
      document.documentElement.style.setProperty('--accent', currentTheme.accent);
      document.documentElement.style.setProperty('--text', currentTheme.textColor);
      document.documentElement.style.setProperty('--card-bg', currentTheme.cardBackground);
      
      console.log('Тема установлена:', theme);
    } catch (error) {
      console.error('Ошибка при сохранении темы:', error);
    }
  }, [theme, currentTheme]);
  
  // Функция для установки темы с проверкой на существование
  const handleSetTheme = (newTheme: string) => {
    if (themes[newTheme as keyof typeof themes]) {
      setTheme(newTheme);
    } else {
      console.error(`Тема "${newTheme}" не найдена, установлена тема по умолчанию`);
      setTheme('default');
    }
  };
  
  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme: handleSetTheme, 
      currentTheme,
      themeStyles: currentTheme,
      activeTheme: theme 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

// Обеспечим совместимость с useUserTheme
export function useUserTheme() {
  const context = useContext(ThemeContext);
  return {
    activeTheme: context.theme,
    setUserTheme: context.setTheme,
    currentTheme: context.currentTheme,
  };
}

// Экспортируем для совместимости с App.tsx
export { ThemeProvider as UserThemeProvider };
