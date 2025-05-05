
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"
import { themes } from '@/lib/themes'

export interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
  themeStyles?: typeof themes.default;
  effectiveTheme?: string;
}

export const ThemeProviderContext = React.createContext<ThemeContextType>({
  theme: 'default',
  setTheme: () => null,
  themeStyles: themes.default
});

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<string>('default');

  // Load saved theme on initialization
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || localStorage.getItem('userTheme') || localStorage.getItem('dnd-theme') || 'default';
    setTheme(savedTheme);
    
    // Применяем тему к корневому элементу
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.body.className = '';
    document.body.classList.add(`theme-${savedTheme}`);
  }, []);

  // Save theme when it changes
  const handleSetTheme = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Apply theme class to root element
    document.documentElement.setAttribute('data-theme', newTheme);
    document.body.className = '';
    document.body.classList.add(`theme-${newTheme}`);
    
    console.log("Theme set in ThemeProvider:", newTheme);
  };

  const themeContextValue = React.useMemo(() => ({
    theme,
    setTheme: handleSetTheme,
    themeStyles: themes[theme as keyof typeof themes] || themes.default
  }), [theme]);

  return (
    <NextThemesProvider {...props}>
      <ThemeProviderContext.Provider value={themeContextValue}>
        {children}
      </ThemeProviderContext.Provider>
    </NextThemesProvider>
  )
}
