
import React, { createContext, useContext, useState, useEffect } from 'react';
import { themes } from '@/lib/themes';
import { ThemeType, ThemeContextType } from '@/types/theme';

// Создаем контекст с типами
const UserThemeContext = createContext<ThemeContextType>({
  activeTheme: 'default',
  setUserTheme: () => {},
  currentTheme: themes.default
});

// Хук для использования контекста темы
export const useTheme = () => useContext(UserThemeContext);

interface UserThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeType;
}

// Компонент-провайдер для темы
export const UserThemeProvider: React.FC<UserThemeProviderProps> = ({ 
  children, 
  defaultTheme = 'default' 
}) => {
  const [activeTheme, setActiveTheme] = useState<ThemeType>(defaultTheme);
  const [currentTheme, setCurrentTheme] = useState(themes[defaultTheme as keyof typeof themes] || themes.default);
  
  // Функция для установки темы
  const setUserTheme = (theme: ThemeType) => {
    setActiveTheme(theme);
    localStorage.setItem('user-theme', theme);
  };
  
  // Эффект для загрузки сохраненной темы при инициализации
  useEffect(() => {
    const savedTheme = localStorage.getItem('user-theme') as ThemeType;
    if (savedTheme && themes[savedTheme]) {
      setActiveTheme(savedTheme);
    }
  }, []);
  
  // Эффект для обновления текущей темы при изменении активной темы
  useEffect(() => {
    setCurrentTheme(themes[activeTheme] || themes.default);
    
    // Обновляем CSS переменные для глобальной темы
    document.documentElement.style.setProperty('--primary-color', currentTheme.primaryColor);
    document.documentElement.style.setProperty('--secondary-color', currentTheme.secondaryColor);
    document.documentElement.style.setProperty('--background-color', currentTheme.backgroundColor);
  }, [activeTheme, currentTheme]);

  return (
    <UserThemeContext.Provider value={{ activeTheme, setUserTheme, currentTheme }}>
      {children}
    </UserThemeContext.Provider>
  );
};

export default useTheme;
