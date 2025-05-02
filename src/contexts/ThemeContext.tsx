
import React, { createContext, useContext, useEffect, useState } from "react";
import { themes } from "@/lib/themes";

export type Theme = 'default' | 'warlock' | 'wizard' | 'druid' | 'warrior' | 'bard';

interface ThemeContextType {
  theme: Theme;
  setTheme: (newTheme: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>("default");

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as Theme;
    if (storedTheme && Object.keys(themes).includes(storedTheme)) {
      setTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    // Применение темы при изменении
    applyTheme(theme);
    // Сохраняем выбранную тему в localStorage
    localStorage.setItem("theme", theme);
  }, [theme]);

  const applyTheme = (themeName: Theme) => {
    const body = document.body;
    
    // Удаляем все предыдущие классы тем
    Object.keys(themes).forEach(key => {
      body.classList.remove(`theme-${key}`);
    });
    
    // Добавляем новый класс темы
    body.classList.add(`theme-${themeName}`);
    
    // Обновляем глобальную переменную темы
    document.documentElement.setAttribute('data-theme', themeName);

    // Применяем CSS переменные из темы
    const selectedTheme = themes[themeName];
    if (selectedTheme) {
      // Основные цвета темы
      document.documentElement.style.setProperty('--primary-gradient', selectedTheme.primary);
      document.documentElement.style.setProperty('--secondary-gradient', selectedTheme.secondary);
      document.documentElement.style.setProperty('--accent-color', selectedTheme.accent);
      document.documentElement.style.setProperty('--glow-effect', selectedTheme.glow);
      document.documentElement.style.setProperty('--text-color', selectedTheme.textColor);
      document.documentElement.style.setProperty('--contrast-color', selectedTheme.contrastColor);
      document.documentElement.style.setProperty('--muted-text-color', selectedTheme.mutedTextColor);
      
      // Фон для всех страниц, учитывая тему
      document.documentElement.style.setProperty('--background-color', themeName === 'default' ? '#1A1105' : '#0A0A0A');
      
      // Переменные tailwind для конкретной темы
      document.documentElement.style.setProperty('--primary', selectedTheme.accent.replace('#', ''));
      document.documentElement.style.setProperty('--background', themeName === 'default' ? '26 10% 5%' : '0 0% 5%');
      
      // Позаботимся о переменных для компонентов shadcn
      const hue = parseInt(selectedTheme.accent.replace('#', ''), 16);
      const h = hue % 360;
      const s = '70%';
      const l = '50%';
      
      document.documentElement.style.setProperty('--primary', `${h} ${s} ${l}`);
      document.documentElement.style.setProperty('--primary-foreground', '0 0% 98%');
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
