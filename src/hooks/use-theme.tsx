
import { useContext } from 'react';
import { ThemeContext, Theme } from '@/contexts/ThemeContext';

export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    console.warn('useTheme must be used within a ThemeProvider');
    return { 
      theme: 'default' as Theme, 
      setTheme: (theme: Theme) => {
        console.warn(`Unable to set theme to ${theme}: ThemeProvider not found`);
      }
    };
  }
  
  return context;
};

export default useTheme;
