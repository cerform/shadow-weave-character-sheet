
import { useContext, createContext, useState, useEffect, ReactNode } from 'react';
import { themes } from '@/lib/themes';

interface UserThemeContextProps {
  activeTheme: string;
  setUserTheme: (theme: string) => void;
  currentTheme?: typeof themes.default;
}

const UserThemeContext = createContext<UserThemeContextProps>({
  activeTheme: 'default',
  setUserTheme: () => {}
});

export const UserThemeProvider = ({ children }: { children: ReactNode }) => {
  const [activeTheme, setActiveTheme] = useState<string>('default');
  const [initialized, setInitialized] = useState(false);
  
  useEffect(() => {
    try {
      // Проверяем несколько возможных мест хранения темы
      const savedUserTheme = 
        localStorage.getItem('userTheme') || 
        localStorage.getItem('dnd-theme') || 
        localStorage.getItem('theme') || 
        'default';
        
      if (savedUserTheme && themes[savedUserTheme as keyof typeof themes]) {
        setActiveTheme(savedUserTheme);
        console.log("Loaded user theme from storage:", savedUserTheme);
        
        // Применяем тему к документу
        document.documentElement.setAttribute('data-theme', savedUserTheme);
        document.body.className = '';
        document.body.classList.add(`theme-${savedUserTheme}`);
        
        // Устанавливаем CSS-переменные из темы
        applyThemeStyles(savedUserTheme);
      }
      setInitialized(true);
    } catch (e) {
      console.error('Error loading user theme:', e);
      setInitialized(true);
    }
  }, []);
  
  const applyThemeStyles = (themeName: string) => {
    const currentTheme = themes[themeName as keyof typeof themes] || themes.default;
    document.documentElement.style.setProperty('--background', currentTheme.background);
    document.documentElement.style.setProperty('--foreground', currentTheme.foreground);
    document.documentElement.style.setProperty('--primary', currentTheme.primary);
    document.documentElement.style.setProperty('--accent', currentTheme.accent);
    document.documentElement.style.setProperty('--text', currentTheme.textColor);
    document.documentElement.style.setProperty('--card-bg', currentTheme.cardBackground);
  };
  
  const setUserTheme = (theme: string) => {
    // Проверяем, что тема существует
    if (!themes[theme as keyof typeof themes]) {
      console.warn(`Theme "${theme}" does not exist, using default theme instead.`);
      theme = 'default';
    }
    
    // Сохраняем пользовательскую тему
    localStorage.setItem('userTheme', theme);
    localStorage.setItem('dnd-theme', theme);
    localStorage.setItem('theme', theme);
    setActiveTheme(theme);
    
    // Применяем тему к документу
    document.documentElement.setAttribute('data-theme', theme);
    document.body.className = '';
    document.body.classList.add(`theme-${theme}`);
    
    // Применяем CSS-переменные из темы
    applyThemeStyles(theme);
    
    console.log("User theme set to:", theme);
  };
  
  const currentTheme = themes[activeTheme as keyof typeof themes] || themes.default;
  
  return (
    <UserThemeContext.Provider value={{ 
      activeTheme, 
      setUserTheme,
      currentTheme
    }}>
      {children}
    </UserThemeContext.Provider>
  );
};

export const useUserTheme = () => {
  const context = useContext(UserThemeContext);
  
  if (context === undefined) {
    console.warn('useUserTheme must be used within a UserThemeProvider');
    return { 
      activeTheme: 'default', 
      setUserTheme: (theme: string) => {},
      currentTheme: themes.default 
    };
  }
  
  return context;
};

export default useUserTheme;
