
import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeType = 'default' | 'dark' | 'light' | 'fantasy' | 'modern' | 'cyberpunk' | 'wizard' | 'warlock' | 'druid' | 'warrior' | 'bard';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  currentTheme?: any; // Для совместимости с существующим кодом
  themeStyles?: any; // Для совместимости с существующим кодом
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
      if (savedTheme && ['default', 'dark', 'light', 'fantasy', 'modern', 'cyberpunk', 'wizard', 'warlock', 'druid', 'warrior', 'bard'].includes(savedTheme)) {
        return savedTheme as ThemeType;
      }
    }
    return defaultTheme;
  });
  
  // Add state for currentTheme to make it compatible with existing code
  const [currentTheme, setCurrentTheme] = useState<any>(null);

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove all existing theme classes
    root.classList.remove('theme-default', 'theme-dark', 'theme-light', 'theme-fantasy', 'theme-modern', 'theme-cyberpunk', 'theme-wizard', 'theme-warlock', 'theme-druid', 'theme-warrior', 'theme-bard');
    
    // Add the current theme class
    root.classList.add(`theme-${theme}`);
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
    
    // Import themes dynamically to avoid circular dependencies
    import('../lib/themes').then(themesModule => {
      const themeObj = themesModule.themes[theme] || themesModule.themes.default;
      setCurrentTheme(themeObj);
      
      // Apply CSS variables from theme
      document.documentElement.style.setProperty('--background', themeObj.background);
      document.documentElement.style.setProperty('--foreground', themeObj.foreground);
      document.documentElement.style.setProperty('--primary', themeObj.primary);
      document.documentElement.style.setProperty('--accent', themeObj.accent);
      document.documentElement.style.setProperty('--text', themeObj.textColor);
      document.documentElement.style.setProperty('--card-bg', themeObj.cardBackground);
    });
  }, [theme]);

  const value = {
    theme,
    setTheme,
    currentTheme,
    themeStyles: currentTheme, // For compatibility
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

export default useTheme;
