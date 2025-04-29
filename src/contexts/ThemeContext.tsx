
import React, { createContext, useContext, useEffect, useState } from "react";
import { themes } from "@/lib/themes";

export type Theme = 'default' | 'warlock' | 'wizard' | 'druid' | 'warrior' | 'bard' | 'paladin' | 'rogue';

interface ThemeContextType {
  theme: Theme;
  setTheme: (newTheme: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>("default");

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as Theme;
    if (storedTheme) {
      setTheme(storedTheme);
      applyTheme(storedTheme);
    } else {
      applyTheme(theme);
    }
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
