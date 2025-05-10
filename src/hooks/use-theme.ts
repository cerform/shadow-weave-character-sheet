
import { useContext } from 'react';
import { ThemeContext } from '@/contexts/ThemeContext';
import { Theme } from '@/types/theme';

// Export the hook and types
export { ThemeContext };

// Export types correctly with 'export type'
export type { Theme, ThemeType } from '@/types/theme';

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default useTheme;
