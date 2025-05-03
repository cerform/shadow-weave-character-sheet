
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

export type Theme = 'default' | 'dark' | 'fantasy' | 'cyber' | 'nature';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const defaultThemeContext: ThemeContextType = {
  theme: 'default',
  setTheme: () => {},
};

export const ThemeContext = createContext<ThemeContextType>(defaultThemeContext);

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('default');

  // Загружаем сохраненную тему при инициализации
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme && ['default', 'dark', 'fantasy', 'cyber', 'nature'].includes(savedTheme)) {
        setTheme(savedTheme as Theme);
      }
    } catch (error) {
      console.error('Ошибка при загрузке темы из localStorage:', error);
    }
  }, []);

  // Сохраняем тему при изменении
  const handleSetTheme = (newTheme: Theme) => {
    try {
      setTheme(newTheme);
      localStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Ошибка при сохранении темы в localStorage:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
