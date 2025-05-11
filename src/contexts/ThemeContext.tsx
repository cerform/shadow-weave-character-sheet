
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { themes } from '@/lib/themes';
import { ThemeType, ThemeStyles } from '@/types/theme';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  currentTheme: ThemeStyles;
  themeStyles: ThemeStyles;
}

// Add missing properties to match ThemeStyles interface
const defaultTheme: ThemeStyles = {
  ...themes.default,
  name: 'default', // Добавляем name, так как он обязателен в ThemeStyles
  mutedTextColor: '#6c757d', // Добавляем обязательное свойство
  borderColor: 'rgba(107, 33, 168, 0.3)',
  shadowColor: 'rgba(107, 33, 168, 0.2)',
  fontFamily: 'system-ui, sans-serif',
};

const defaultThemeContext: ThemeContextType = {
  theme: 'default',
  setTheme: () => {},
  currentTheme: defaultTheme,
  themeStyles: defaultTheme,
};

export const ThemeContext = createContext<ThemeContextType>(defaultThemeContext);

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeType>('default');
  const [currentTheme, setCurrentTheme] = useState<ThemeStyles>(defaultTheme);

  // Загружаем сохраненную тему при инициализации
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme && Object.keys(themes).includes(savedTheme)) {
        setTheme(savedTheme as ThemeType);
        
        // Add missing properties to match ThemeStyles interface
        const themeWithAllProps: ThemeStyles = {
          ...(themes[savedTheme as keyof typeof themes] || themes.default),
          name: savedTheme || 'default', // Добавляем name, так как он обязателен
          mutedTextColor: themes[savedTheme as keyof typeof themes]?.mutedTextColor || '#6c757d',
          borderColor: 'rgba(107, 33, 168, 0.3)',
          shadowColor: 'rgba(107, 33, 168, 0.2)',
          fontFamily: 'system-ui, sans-serif',
        };
        setCurrentTheme(themeWithAllProps);
      }
    } catch (error) {
      console.error('Ошибка при загрузке темы из localStorage:', error);
    }
  }, []);

  // Сохраняем тему при изменении
  const handleSetTheme = (newTheme: ThemeType) => {
    try {
      setTheme(newTheme);
      
      // Add missing properties to match ThemeStyles interface
      const themeWithAllProps: ThemeStyles = {
        ...(themes[newTheme as keyof typeof themes] || themes.default),
        name: newTheme || 'default', // Добавляем name, так как он обязателен
        mutedTextColor: themes[newTheme as keyof typeof themes]?.mutedTextColor || '#6c757d',
        borderColor: 'rgba(107, 33, 168, 0.3)',
        shadowColor: 'rgba(107, 33, 168, 0.2)',
        fontFamily: 'system-ui, sans-serif',
      };
      setCurrentTheme(themeWithAllProps);
      localStorage.setItem('theme', newTheme as string);
      console.log('Тема изменена на:', newTheme);
      
      // Применяем класс темы к корневому элементу
      document.documentElement.setAttribute('data-theme', newTheme as string);
      document.body.className = '';
      document.body.classList.add(`theme-${newTheme}`);
      
      // Apply CSS variables from theme
      const themeObj = themes[newTheme as keyof typeof themes] || themes.default;
      document.documentElement.style.setProperty('--background', themeObj.background);
      document.documentElement.style.setProperty('--foreground', themeObj.foreground || '#1e293b');
      document.documentElement.style.setProperty('--primary', themeObj.primary || '#818cf8');
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
