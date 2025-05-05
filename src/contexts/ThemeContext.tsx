
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

export type Theme = 'default' | 'dark' | 'fantasy' | 'cyber' | 'nature' | 'warlock' | 'wizard' | 'druid' | 'warrior' | 'bard';

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
  const [theme, setTheme] = useState<Theme>(() => {
    // Первичная инициализация из localStorage
    try {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme && ['default', 'dark', 'fantasy', 'cyber', 'nature', 'warlock', 'wizard', 'druid', 'warrior', 'bard'].includes(savedTheme)) {
        return savedTheme as Theme;
      }
    } catch (error) {
      console.error('Ошибка при загрузке темы из localStorage:', error);
    }
    return 'default';
  });

  // Сохраняем тему при изменении
  const handleSetTheme = (newTheme: Theme) => {
    try {
      setTheme(newTheme);
      localStorage.setItem('theme', newTheme);
      console.log('Тема изменена на:', newTheme);
      
      // Применяем класс темы к корневому элементу
      document.documentElement.setAttribute('data-theme', newTheme);
      document.body.className = '';
      document.body.classList.add(`theme-${newTheme}`);
    } catch (error) {
      console.error('Ошибка при сохранении темы в localStorage:', error);
    }
  };

  // Применяем сохраненную тему при монтировании
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) {
      handleSetTheme(savedTheme);
    } else {
      // Если тема не найдена, устанавливаем дефолтную
      handleSetTheme('default');
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
