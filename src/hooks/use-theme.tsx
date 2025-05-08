
import React, { createContext, useContext, useState, useEffect } from 'react';
import { themes } from '@/lib/themes';

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'default',
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<string>(() => {
    const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') : 'default';
    return savedTheme || 'default';
  });

  const setTheme = (newTheme: string) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
    }
    document.documentElement.dataset.theme = newTheme;
  };

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
