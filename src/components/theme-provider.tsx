
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"
import { themes } from '@/lib/themes'
import { ThemeType } from '@/types/theme'

export interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  themeStyles: typeof themes.default;
  effectiveTheme?: ThemeType;
}

export const ThemeProviderContext = React.createContext<ThemeContextType>({
  theme: 'default' as ThemeType,
  setTheme: () => null,
  themeStyles: themes.default
});

// Update the ThemeProvider interface to include defaultTheme
interface CustomThemeProviderProps extends ThemeProviderProps {
  defaultTheme?: ThemeType;
}

export function ThemeProvider({ children, defaultTheme = 'default', ...props }: CustomThemeProviderProps) {
  const [theme, setTheme] = React.useState<ThemeType>(defaultTheme);

  // Apply theme to root element when theme changes
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.className = '';
    document.body.classList.add(`theme-${theme}`);
    
    // Apply CSS variables from theme
    const currentTheme = themes[theme as keyof typeof themes] || themes.default;
    document.documentElement.style.setProperty('--background', currentTheme.background);
    document.documentElement.style.setProperty('--foreground', currentTheme.foreground);
    document.documentElement.style.setProperty('--primary', currentTheme.primary);
    document.documentElement.style.setProperty('--accent', currentTheme.accent);
    document.documentElement.style.setProperty('--text', currentTheme.textColor);
    document.documentElement.style.setProperty('--card-bg', currentTheme.cardBackground);
    
    // Save theme in localStorage
    localStorage.setItem('theme', theme as string);
    
    console.log("Theme set in ThemeProvider:", theme);
  }, [theme]);

  const themeContextValue = React.useMemo(() => ({
    theme,
    setTheme,
    themeStyles: themes[theme as keyof typeof themes] || themes.default,
    effectiveTheme: theme
  }), [theme]);

  return (
    <NextThemesProvider {...props}>
      <ThemeProviderContext.Provider value={themeContextValue}>
        {children}
      </ThemeProviderContext.Provider>
    </NextThemesProvider>
  )
}
