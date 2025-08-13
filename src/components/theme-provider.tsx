
import React, { createContext, useState, useEffect, useMemo } from 'react';
import { themes } from '@/lib/themes';

export interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
  themeStyles?: typeof themes.default;
  effectiveTheme?: string;
}

export const ThemeProviderContext = createContext<ThemeContextType>({
  theme: 'default',
  setTheme: () => null,
  themeStyles: themes.default
});

interface CustomThemeProviderProps {
  children: React.ReactNode;
}

// Fallback component that doesn't use hooks
function FallbackThemeProvider({ children }: CustomThemeProviderProps) {
  const fallbackValue = {
    theme: 'default',
    setTheme: () => {},
    themeStyles: themes.default,
    effectiveTheme: 'default'
  };

  // Apply default theme without hooks
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', 'default');
    document.body.className = 'theme-default';
    document.documentElement.style.setProperty('--background', themes.default.background);
    document.documentElement.style.setProperty('--foreground', themes.default.foreground);
    document.documentElement.style.setProperty('--primary', themes.default.primary);
    document.documentElement.style.setProperty('--accent', themes.default.accent);
    document.documentElement.style.setProperty('--text', themes.default.textColor);
    document.documentElement.style.setProperty('--card-bg', themes.default.cardBackground);
  }

  return (
    <ThemeProviderContext.Provider value={fallbackValue}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

// Check if React hooks are available
function isReactHooksAvailable() {
  try {
    // @ts-ignore - accessing internal React API
    return React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?.ReactCurrentDispatcher?.current !== null;
  } catch {
    return false;
  }
}

export function ThemeProvider({ children }: CustomThemeProviderProps) {
  // If React hooks are not available, use fallback
  if (!isReactHooksAvailable()) {
    return <FallbackThemeProvider>{children}</FallbackThemeProvider>;
  }

  let theme: string;
  let setTheme: (theme: string) => void;
  
  try {
    [theme, setTheme] = useState<string>('default');
  } catch (error) {
    console.error('useState error in ThemeProvider:', error);
    return <FallbackThemeProvider>{children}</FallbackThemeProvider>;
  }

  // Safe useEffect wrapper
  try {
    // Загружаем сохраненную тему при инициализации
    useEffect(() => {
      try {
        const savedTheme = localStorage.getItem('theme') || 'default';
        if (themes[savedTheme as keyof typeof themes]) {
          setTheme(savedTheme);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    }, []);

    // Применяем тему к корневому элементу при изменении темы
    useEffect(() => {
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
  } catch (error) {
    console.error('useEffect error in ThemeProvider:', error);
    return <FallbackThemeProvider>{children}</FallbackThemeProvider>;
  }

  // Обработчик для установки темы
  const handleSetTheme = (newTheme: string) => {
    setTheme(newTheme);
    
    // Сохраняем тему в localStorage
    localStorage.setItem('theme', newTheme);
    
    console.log("Theme set in ThemeProvider:", newTheme);
  };

  const themeContextValue = useMemo(() => ({
    theme,
    setTheme: handleSetTheme,
    themeStyles: themes[theme as keyof typeof themes] || themes.default,
    effectiveTheme: theme
  }), [theme]);

  return (
    <ThemeProviderContext.Provider value={themeContextValue}>
      {children}
    </ThemeProviderContext.Provider>
  );
}
