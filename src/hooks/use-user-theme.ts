
import { useContext } from 'react';
import { ThemeContext } from './use-theme';
import { Theme, ThemeType } from '@/types/theme';

export function useUserTheme() {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useUserTheme must be used within a ThemeProvider');
  }
  
  return {
    activeTheme: context.theme,
    setUserTheme: context.setTheme,
    currentTheme: context.currentTheme
  };
}

export default useUserTheme;
