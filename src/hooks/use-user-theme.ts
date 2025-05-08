
import { useState, useEffect } from 'react';

interface UserThemeHook {
  activeTheme: string;
  setUserTheme: (theme: string) => void;
}

export const useUserTheme = (): UserThemeHook => {
  const [activeTheme, setActiveTheme] = useState<string>('default');
  
  useEffect(() => {
    // Try to get stored theme from localStorage on component mount
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      setActiveTheme(storedTheme);
    }
  }, []);
  
  const setUserTheme = (theme: string) => {
    setActiveTheme(theme);
    localStorage.setItem('theme', theme);
  };
  
  return { activeTheme, setUserTheme };
};

export default useUserTheme;
