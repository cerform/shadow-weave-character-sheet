
import React, { createContext, useContext, useState, useEffect } from 'react';
import { themes } from '@/lib/themes';
import { ThemeType, ThemeContextType, Theme } from '@/types/theme';

// Create context with proper types
const UserThemeContext = createContext<ThemeContextType>({
  activeTheme: 'default',
  setUserTheme: () => {},
  currentTheme: themes.default,
  themeStyles: themes.default, // Add themeStyles for components that need it
  theme: 'default',
  setTheme: () => {}
});

// Hook for using the theme context
export const useTheme = () => useContext(UserThemeContext);

interface UserThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeType;
}

// Theme provider component
export const UserThemeProvider: React.FC<UserThemeProviderProps> = ({ 
  children, 
  defaultTheme = 'default' 
}) => {
  const [activeTheme, setActiveTheme] = useState<ThemeType>(defaultTheme);
  const [currentTheme, setCurrentTheme] = useState(themes[defaultTheme as keyof typeof themes] || themes.default);
  
  // Function for setting the theme
  const setUserTheme = (theme: ThemeType) => {
    setActiveTheme(theme);
    localStorage.setItem('user-theme', theme.toString());
  };

  // Alias for compatibility with other components
  const setTheme = (theme: string | ThemeType) => {
    setUserTheme(theme as ThemeType);
  };
  
  // Effect for loading saved theme on initialization
  useEffect(() => {
    const savedTheme = localStorage.getItem('user-theme') as ThemeType;
    if (savedTheme && themes[savedTheme as keyof typeof themes]) {
      setActiveTheme(savedTheme);
    }
  }, []);
  
  // Effect for updating current theme when active theme changes
  useEffect(() => {
    const themeObj = themes[activeTheme as keyof typeof themes] || themes.default;
    setCurrentTheme(themeObj);
    
    // Update CSS variables for global theme
    document.documentElement.style.setProperty('--primary-color', themeObj.primary);
    document.documentElement.style.setProperty('--secondary-color', themeObj.secondary);
    document.documentElement.style.setProperty('--background-color', themeObj.background);
  }, [activeTheme]);

  return (
    <UserThemeContext.Provider value={{ 
      activeTheme, 
      setUserTheme, 
      currentTheme,
      themeStyles: currentTheme, // Add themeStyles for components that need it
      theme: activeTheme,
      setTheme
    }}>
      {children}
    </UserThemeContext.Provider>
  );
};

export default useTheme;
