
import { useContext } from 'react';
import { ThemeContext } from '@/contexts/ThemeContext';
import { Theme, ThemeType, ThemeContextType } from '@/types/theme';
import { themes } from '@/lib/themes';

// Export the hook and context
export { ThemeContext };

// Export types correctly with 'export type'
export type { Theme, ThemeType, ThemeContextType };

export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  // Ensure themeStyles is available by using currentTheme or falling back to the theme from themes object
  const themeKey = (context.theme || 'default') as ThemeType;
  const themeStyles = context.currentTheme || themes[themeKey] || themes.default;
  
  return {
    ...context,
    themeStyles
  };
};

export default useTheme;
