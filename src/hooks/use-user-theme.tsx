
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Theme, themes } from '@/lib/themes';
import { ThemeType, useTheme } from '@/hooks/use-theme';

interface UserThemeContextType {
  activeTheme: ThemeType;
  setUserTheme: (theme: ThemeType) => void;
  currentTheme: Theme;
}

const UserThemeContext = createContext<UserThemeContextType>({
  activeTheme: 'default',
  setUserTheme: () => {},
  currentTheme: themes.default
});

export const UserThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const globalTheme = useTheme();
  const [activeTheme, setActiveTheme] = useState<ThemeType>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('userTheme') || 'default';
      return savedTheme as ThemeType;
    }
    return 'default';
  });

  // Sync with global theme
  useEffect(() => {
    if (globalTheme.theme !== activeTheme) {
      globalTheme.setTheme(activeTheme);
    }
  }, [activeTheme, globalTheme]);

  const currentTheme = themes[activeTheme] || themes.default;

  const setUserTheme = (theme: ThemeType) => {
    setActiveTheme(theme);
    globalTheme.setTheme(theme);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('userTheme', theme);
    }
  };

  // Apply theme to document when theme changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', activeTheme);
      // Apply CSS variables
      document.documentElement.style.setProperty('--primary', currentTheme.primary);
      document.documentElement.style.setProperty('--secondary', currentTheme.secondary);
      document.documentElement.style.setProperty('--accent', currentTheme.accent);
      document.documentElement.style.setProperty('--background', currentTheme.background);
      document.documentElement.style.setProperty('--foreground', currentTheme.foreground);
      document.documentElement.style.setProperty('--text-color', currentTheme.textColor);
      document.documentElement.style.setProperty('--muted-text', currentTheme.mutedTextColor);
      document.documentElement.style.setProperty('--card-background', currentTheme.cardBackground);
    }
  }, [activeTheme, currentTheme]);

  return (
    <UserThemeContext.Provider value={{ activeTheme, setUserTheme, currentTheme }}>
      {children}
    </UserThemeContext.Provider>
  );
};

export const useUserTheme = () => useContext(UserThemeContext);
