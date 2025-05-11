
import React, { createContext, useContext, useState, useEffect } from 'react';
import { themes, ThemeType } from '@/lib/themes';

// Контекст темы с начальным значением
interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  currentTheme?: any; // Добавляем для совместимости с другими компонентами
  themeStyles?: any; // Добавляем для совместимости со старыми компонентами
}

// Создание контекста с базовыми значениями
export const ThemeContext = createContext<ThemeContextType>({
  theme: 'default',
  setTheme: () => {},
  currentTheme: themes.default,
  themeStyles: themes.default
});

// Интерфейс для свойств ThemeProvider
interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeType;
}

// Хук для использования темы в компонентах
export const useTheme = () => useContext(ThemeContext);

// Провайдер темы для обертки приложения
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, defaultTheme = 'default' }) => {
  // Получаем сохраненную тему из localStorage или используем переданную по умолчанию
  const [theme, setTheme] = useState<ThemeType>(() => {
    try {
      const savedTheme = localStorage.getItem('app-theme') as ThemeType;
      // Validate theme exists in our themes object
      return savedTheme && themes[savedTheme] ? savedTheme : defaultTheme;
    } catch (e) {
      console.error('Error loading theme from localStorage:', e);
      return defaultTheme;
    }
  });

  // Get the current theme object
  const currentThemeObj = themes[theme] || themes.default;

  // Обновляем документ и localStorage при изменении темы
  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('app-theme', theme);
      
      // Apply CSS variables
      document.documentElement.style.setProperty('--background', currentThemeObj.background);
      document.documentElement.style.setProperty('--foreground', currentThemeObj.foreground || '#1e293b');
      document.documentElement.style.setProperty('--primary', currentThemeObj.primary || '#818cf8');
      document.documentElement.style.setProperty('--accent', currentThemeObj.accent);
      document.documentElement.style.setProperty('--text', currentThemeObj.textColor);
      document.documentElement.style.setProperty('--card-bg', currentThemeObj.cardBackground);
    } catch (e) {
      console.error('Error setting theme:', e);
    }
  }, [theme, currentThemeObj]);

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme,
      currentTheme: currentThemeObj, 
      themeStyles: currentThemeObj
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default useTheme;
