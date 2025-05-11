
import React, { createContext, useContext, useState, useEffect } from 'react';

// Определение типа темы
export type ThemeType = 'light' | 'dark' | 'wizard' | 'warlock' | 'default';

// Контекст темы с начальным значением
interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

// Создание контекста с базовыми значениями
export const ThemeContext = createContext<ThemeContextType>({
  theme: 'default',
  setTheme: () => {}
});

// Хук для использования темы в компонентах
export const useTheme = () => useContext(ThemeContext);

// Провайдер темы для обертки приложения
export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // Получаем сохраненную тему из localStorage или используем дефолтную
  const [theme, setTheme] = useState<ThemeType>(() => {
    const savedTheme = localStorage.getItem('app-theme') as ThemeType;
    return savedTheme || 'default';
  });

  // Обновляем документ и localStorage при изменении темы
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default useTheme;
