
import { useContext, createContext, useState, useEffect, ReactNode } from 'react';
import { themes } from '@/lib/themes';

interface UserThemeContextProps {
  activeTheme: string | null;
  setUserTheme: (theme: string) => void;
}

const UserThemeContext = createContext<UserThemeContextProps>({
  activeTheme: null,
  setUserTheme: () => {}
});

export const UserThemeProvider = ({ children }: { children: ReactNode }) => {
  const [activeTheme, setActiveTheme] = useState<string | null>(null);
  
  useEffect(() => {
    try {
      const savedUserTheme = localStorage.getItem('userTheme');
      if (savedUserTheme && themes[savedUserTheme as keyof typeof themes]) {
        setActiveTheme(savedUserTheme);
      }
    } catch (e) {
      console.error('Error loading user theme:', e);
    }
  }, []);
  
  const setUserTheme = (theme: string) => {
    if (theme === 'default') {
      localStorage.removeItem('userTheme');
      setActiveTheme(null);
    } else {
      localStorage.setItem('userTheme', theme);
      setActiveTheme(theme);
    }
  };
  
  return (
    <UserThemeContext.Provider value={{ activeTheme, setUserTheme }}>
      {children}
    </UserThemeContext.Provider>
  );
};

export const useUserTheme = () => useContext(UserThemeContext);

export default useUserTheme;
