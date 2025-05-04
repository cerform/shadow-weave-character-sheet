
import { useContext } from 'react';
import { ThemeContext, Theme } from '@/contexts/ThemeContext';

export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    console.error('useTheme must be used within a ThemeProvider');
    return { 
      theme: 'default' as Theme, 
      setTheme: (theme: Theme) => {
        console.error(`Unable to set theme to ${theme}: ThemeProvider not found`);
      }
    };
  }
  
  return context;
};

export default useTheme;
