
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
      // Проверяем несколько возможных мест хранения темы
      const savedUserTheme = 
        localStorage.getItem('userTheme') || 
        localStorage.getItem('dnd-theme') || 
        localStorage.getItem('theme');
        
      if (savedUserTheme && themes[savedUserTheme as keyof typeof themes]) {
        setActiveTheme(savedUserTheme);
        console.log("Loaded user theme from storage:", savedUserTheme);
      }
    } catch (e) {
      console.error('Error loading user theme:', e);
    }
  }, []);
  
  const setUserTheme = (theme: string) => {
    if (theme === 'default') {
      // При выборе темы по умолчанию, очищаем пользовательскую тему
      localStorage.removeItem('userTheme');
      localStorage.removeItem('dnd-theme');
      setActiveTheme(null);
    } else {
      // Сохраняем новую пользовательскую тему
      localStorage.setItem('userTheme', theme);
      localStorage.setItem('dnd-theme', theme);
      setActiveTheme(theme);
    }
    
    console.log("User theme set to:", theme);
  };
  
  return (
    <UserThemeContext.Provider value={{ activeTheme, setUserTheme }}>
      {children}
    </UserThemeContext.Provider>
  );
};

export const useUserTheme = () => useContext(UserThemeContext);

export default useUserTheme;
