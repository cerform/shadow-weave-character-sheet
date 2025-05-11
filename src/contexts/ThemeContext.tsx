
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { themes } from '@/lib/themes';
import { ThemeType, ThemeStyles } from '@/types/theme';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  currentTheme: ThemeStyles;
  themeStyles: ThemeStyles;
}

const defaultThemeContext: ThemeContextType = {
  theme: 'default',
  setTheme: () => {},
  currentTheme: themes.default,
  themeStyles: themes.default,
};

export const ThemeContext = createContext<ThemeContextType>(defaultThemeContext);

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeType>('default');
  const [currentTheme, setCurrentTheme] = useState<ThemeStyles>(themes.default);

  // Загружаем сохраненную тему при инициализации
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme && Object.keys(themes).includes(savedTheme)) {
        setTheme(savedTheme as ThemeType);
        setCurrentTheme(themes[savedTheme as keyof typeof themes] || themes.default);
      }
    } catch (error) {
      console.error('Ошибка при загрузке темы из localStorage:', error);
    }
  }, []);

  // Сохраняем тему при изменении
  const handleSetTheme = (newTheme: ThemeType) => {
    try {
      setTheme(newTheme);
      const themeObj = themes[newTheme as keyof typeof themes] || themes.default;
      setCurrentTheme(themeObj);
      localStorage.setItem('theme', newTheme as string);
      console.log('Тема изменена на:', newTheme);
      
      // Применяем класс темы к корневому элементу
      document.documentElement.setAttribute('data-theme', newTheme as string);
      document.body.className = '';
      document.body.classList.add(`theme-${newTheme}`);
      
      // Apply CSS variables from theme
      document.documentElement.style.setProperty('--background', themeObj.background);
      document.documentElement.style.setProperty('--foreground', themeObj.foreground);
      document.documentElement.style.setProperty('--primary', themeObj.primary);
      document.documentElement.style.setProperty('--accent', themeObj.accent);
      document.documentElement.style.setProperty('--text', themeObj.textColor);
      document.documentElement.style.setProperty('--card-bg', themeObj.cardBackground);
    } catch (error) {
      console.error('Ошибка при сохранении темы в localStorage:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme: handleSetTheme,
      currentTheme,
      themeStyles: currentTheme,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
