
import { useContext } from 'react';
import { ThemeContext } from '@/contexts/ThemeContext';
import { ThemeType } from '@/types/theme';

export function useUserTheme() {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useUserTheme must be used within a ThemeProvider');
  }
  
  return {
    activeTheme: context.theme as ThemeType,
    setUserTheme: context.setTheme,
    currentTheme: context.currentTheme
  };
}

export default useUserTheme;

