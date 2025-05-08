
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Theme, themes } from '@/lib/themes';
import { useUserTheme } from '@/hooks/use-user-theme';

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
  themeStyles: Theme;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'default',
  setTheme: () => {},
  themeStyles: themes.default
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeTheme, setUserTheme } = useUserTheme();
  const [theme, setTheme] = useState<string>(activeTheme || 'default');
  const themeStyles = themes[theme as keyof typeof themes] || themes.default;
  
  // Синхронизируем с UserTheme при монтировании
  useEffect(() => {
    if (activeTheme && activeTheme !== theme) {
      setTheme(activeTheme);
    }
  }, [activeTheme]);
  
  // Применяем CSS переменные при изменении темы
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.className = '';
    document.body.classList.add(`theme-${theme}`);
    
    // Устанавливаем CSS переменные
    document.documentElement.style.setProperty('--background', themeStyles.background);
    document.documentElement.style.setProperty('--foreground', themeStyles.foreground);
    document.documentElement.style.setProperty('--primary', themeStyles.primary);
    document.documentElement.style.setProperty('--accent', themeStyles.accent);
    document.documentElement.style.setProperty('--text', themeStyles.textColor);
    document.documentElement.style.setProperty('--card-bg', themeStyles.cardBackground);
  }, [theme, themeStyles]);
  
  // Обработчик для установки темы
  const handleSetTheme = (newTheme: string) => {
    setTheme(newTheme);
    setUserTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    console.log('Theme set in useTheme:', newTheme);
  };
  
  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme: handleSetTheme, 
      themeStyles
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeProvider;
