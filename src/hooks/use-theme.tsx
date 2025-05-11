
import React, { createContext, useContext, useState, useEffect } from 'react';

// Определение типа темы
export type ThemeType = 'light' | 'dark' | 'wizard' | 'warlock' | 'default';

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
  currentTheme: null,
  themeStyles: null
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
    const savedTheme = localStorage.getItem('app-theme') as ThemeType;
    return savedTheme || defaultTheme;
  });

  // Обновляем документ и localStorage при изменении темы
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme,
      currentTheme: { name: theme }, // Добавляем для совместимости
      themeStyles: { name: theme }   // Добавляем для совместимости
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default useTheme;
