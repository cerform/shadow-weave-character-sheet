import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from 'react';

import { ThemeType } from '@/hooks/use-theme';
import { themes, Theme } from '@/lib/themes';

interface UserThemeContextType {
  activeTheme: ThemeType;
  setUserTheme: (theme: ThemeType) => void;
  currentTheme: Theme;
}

const UserThemeContext = createContext<UserThemeContextType | undefined>(undefined);

export const UserThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTheme, setActiveTheme] = useState<ThemeType>('default');

  // Инициализация из localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('userTheme') as ThemeType | null;
      if (saved && themes[saved]) {
        setActiveTheme(saved);
      }
    }
  }, []);

  const currentTheme = themes[activeTheme] || themes.default;

  const setUserTheme = (theme: ThemeType) => {
    setActiveTheme(theme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('userTheme', theme);
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', activeTheme);

      const cssVars = {
        '--primary': currentTheme.primary,
        '--secondary': currentTheme.secondary,
        '--accent': currentTheme.accent,
        '--background': currentTheme.background,
        '--foreground': currentTheme.foreground,
        '--text-color': currentTheme.textColor,
        '--muted-text': currentTheme.mutedTextColor,
        '--card-background': currentTheme.cardBackground,
      };

      Object.entries(cssVars).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value);
      });
    }
  }, [activeTheme, currentTheme]);

  return (
    <UserThemeContext.Provider value={{ activeTheme, setUserTheme, currentTheme }}>
      {children}
    </UserThemeContext.Provider>
  );
};

// Кастомный хук
export const useUserTheme = (): UserThemeContextType => {
  const context = useContext(UserThemeContext);
  if (!context) {
    throw new Error('useUserTheme must be used within a UserThemeProvider');
  }
  return context;
};
