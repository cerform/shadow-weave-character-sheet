
import { useContext } from 'react';
import { ThemeContext } from '@/contexts/ThemeContext';
import { ThemeType } from '@/types/theme';

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export type { ThemeType };
export { ThemeContext } from '@/contexts/ThemeContext';

