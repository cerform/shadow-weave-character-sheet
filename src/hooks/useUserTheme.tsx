
import { createContext, useContext, useState, useEffect } from 'react';
import { themes } from '@/lib/themes';

export type UserThemeContextType = {
  activeTheme: string;
  setUserTheme: (theme: string) => void;
};

const UserThemeContext = createContext<UserThemeContextType | {
  activeTheme: string;
  setUserTheme: (theme: string) => void;
}>({
  activeTheme: 'default',
  setUserTheme: () => {},
});

export const UserThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeTheme, setActiveTheme] = useState(() => {
    const savedTheme = localStorage.getItem('userTheme');
    return savedTheme || 'default';
  });

  useEffect(() => {
    localStorage.setItem('userTheme', activeTheme);
  }, [activeTheme]);

  const setUserTheme = (theme: string) => {
    setActiveTheme(theme);
  };

  return (
    <UserThemeContext.Provider value={{ activeTheme, setUserTheme }}>
      {children}
    </UserThemeContext.Provider>
  );
};

export const useUserTheme = () => {
  const context = useContext(UserThemeContext);
  
  // Получаем текущую тему из контекста
  const themeKey = (context.activeTheme || 'default') as keyof typeof themes;
  const currentThemeStyles = themes[themeKey] || themes.default;
  
  return {
    activeTheme: context.activeTheme,
    setUserTheme: context.setUserTheme,
    currentThemeStyles
  };
};
