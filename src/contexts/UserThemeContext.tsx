
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Theme, themes } from '../lib/themes';
import useSessionStore from "../stores/sessionStore";

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
  currentTheme: Theme;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'default',
  setTheme: () => {},
  currentTheme: themes.default
});

export const ThemeProvider = ({ children }: {children: React.ReactNode}) => {
  const [theme, setTheme] = useState<string>(() => {
    // Загружаем тему из localStorage или используем тему по умолчанию
    const savedTheme = localStorage.getItem('dnd-theme') || 'default';
    return savedTheme;
  });
  
  // Получаем объект темы
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  
  // Сохраняем выбранную тему в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('dnd-theme', theme);
    
    // Устанавливаем CSS-переменные для темы
    document.documentElement.style.setProperty('--background', currentTheme.background);
    document.documentElement.style.setProperty('--foreground', currentTheme.foreground);
    document.documentElement.style.setProperty('--primary', currentTheme.primary);
    document.documentElement.style.setProperty('--accent', currentTheme.accent);
    document.documentElement.style.setProperty('--text', currentTheme.textColor);
    document.documentElement.style.setProperty('--card-bg', currentTheme.cardBackground);
  }, [theme, currentTheme]);
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme, currentTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

// Экспортируем для совместимости с App.tsx
export { ThemeProvider as UserThemeProvider };
