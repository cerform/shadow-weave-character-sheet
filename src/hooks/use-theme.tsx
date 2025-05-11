
import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeType = 'default' | 'dark' | 'light' | 'fantasy' | 'modern' | 'cyberpunk';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeType;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'default',
  setTheme: () => {},
});

export function ThemeProvider({
  children,
  defaultTheme = 'default',
}: ThemeProviderProps) {
  // Use localStorage to persist theme between page reloads
  const [theme, setTheme] = useState<ThemeType>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme && ['default', 'dark', 'light', 'fantasy', 'modern', 'cyberpunk'].includes(savedTheme)) {
        return savedTheme as ThemeType;
      }
    }
    return defaultTheme;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove all existing theme classes
    root.classList.remove('theme-default', 'theme-dark', 'theme-light', 'theme-fantasy', 'theme-modern', 'theme-cyberpunk');
    
    // Add the current theme class
    root.classList.add(`theme-${theme}`);
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  const value = {
    theme,
    setTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeProvider;
