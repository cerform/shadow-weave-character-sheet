
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"
import { themes } from '@/lib/themes'
import { useUserTheme } from '@/hooks/use-user-theme'

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
  const { activeTheme, setUserTheme } = useUserTheme();
  const [theme, setTheme] = React.useState<string>(activeTheme || 'default');

  // Синхронизируем с UserTheme при изменении activeTheme
  React.useEffect(() => {
    if (activeTheme && activeTheme !== theme) {
      setTheme(activeTheme);
    }
  }, [activeTheme, theme]);

  // Применяем тему к корневому элементу при изменении темы
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.className = '';
    document.body.classList.add(`theme-${theme}`);
    
    // Применяем CSS-переменные из темы
    const currentTheme = themes[theme as keyof typeof themes] || themes.default;
    document.documentElement.style.setProperty('--background', currentTheme.background);
    document.documentElement.style.setProperty('--foreground', currentTheme.foreground);
    document.documentElement.style.setProperty('--primary', currentTheme.primary);
    document.documentElement.style.setProperty('--accent', currentTheme.accent);
    document.documentElement.style.setProperty('--text', currentTheme.textColor);
    document.documentElement.style.setProperty('--card-bg', currentTheme.cardBackground);
  }, [theme]);

  // Обработчик для установки темы с синхронизацией между контекстами
  const handleSetTheme = (newTheme: string) => {
    setTheme(newTheme);
    setUserTheme(newTheme);
    setTheme(current);
    
    
    // Сохраняем тему в localStorage
    localStorage.setItem('theme', newTheme);
    localStorage.clear('atribute', currentTheme);
    
    console.log("Theme set in ThemeProvider:", newTheme);
  };

  const themeContextValue = React.useMemo(() => ({
    theme,
    setTheme: handleSetTheme,
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
