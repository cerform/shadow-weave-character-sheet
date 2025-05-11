
import React, { createContext, useContext, useState, useEffect } from 'react';
import { themes } from '@/lib/themes';
import { ThemeType, ThemeContextType, Theme } from '@/types/theme';

// Create context with proper types
const ThemeContext = createContext<ThemeContextType>({
  theme: 'default',
  setTheme: () => {},
  themeStyles: themes.default,
  activeTheme: 'default',
  setUserTheme: () => {},
  currentTheme: themes.default
});

// Hook для использования контекста темы
export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeType;
}

// Theme provider component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  defaultTheme = 'default' 
}) => {
  const [theme, setTheme] = useState<ThemeType>(defaultTheme);
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[theme as keyof typeof themes] || themes.default);
  
  // Функция для установки темы
  const setUserTheme = (newTheme: ThemeType) => {
    console.log('Setting theme to:', newTheme);
    setTheme(newTheme);
    localStorage.setItem('user-theme', newTheme);
    
    // Применение CSS-переменных
    applyThemeToDOM(newTheme);
  };
  
  // Функция для применения CSS переменных к DOM
  const applyThemeToDOM = (themeName: ThemeType) => {
    const themeObj = themes[themeName as keyof typeof themes] || themes.default;
    setCurrentTheme(themeObj);
    
    document.documentElement.setAttribute('data-theme', themeName);
    document.body.className = '';
    document.body.classList.add(`theme-${themeName}`);
    
    // Применение CSS-переменных
    document.documentElement.style.setProperty('--primary', themeObj.primary);
    document.documentElement.style.setProperty('--secondary', themeObj.secondary);
    document.documentElement.style.setProperty('--background', themeObj.background);
    document.documentElement.style.setProperty('--foreground', themeObj.foreground);
    document.documentElement.style.setProperty('--text-color', themeObj.textColor);
    document.documentElement.style.setProperty('--accent', themeObj.accent);
    document.documentElement.style.setProperty('--card-bg', themeObj.cardBackground);
  };
  
  // Загрузка сохраненной темы при загрузке приложения
  useEffect(() => {
    const savedTheme = localStorage.getItem('user-theme') as ThemeType;
    if (savedTheme && themes[savedTheme as keyof typeof themes]) {
      setUserTheme(savedTheme);
    } else {
      setUserTheme(defaultTheme);
    }
  }, [defaultTheme]);
  
  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme: setUserTheme,
      themeStyles: currentTheme,
      activeTheme: theme,
      setUserTheme,
      currentTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default useTheme;
export { ThemeContext };
