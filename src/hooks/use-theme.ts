
import { useContext } from 'react';
import { ThemeContext } from '@/contexts/ThemeContext';
import { Theme, ThemeType, ThemeContextType } from '@/types/theme';

// Export the hook and context
export { ThemeContext };

// Export types correctly with 'export type'
export type { Theme, ThemeType, ThemeContextType };

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default useTheme;
