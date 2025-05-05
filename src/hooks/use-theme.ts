
import { useContext } from 'react';
import { ThemeProviderContext } from '@/components/theme-provider';
import { themes } from '@/lib/themes';

export interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
  themeStyles?: typeof themes.default;
  effectiveTheme?: string;
}

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeProviderContext);
  
  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');
    
  return context;
};
