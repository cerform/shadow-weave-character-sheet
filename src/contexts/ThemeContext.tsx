
import React, { createContext, useContext, useEffect, useState } from "react";
import { themes } from "@/lib/themes";
import { useSessionStore } from "@/stores/sessionStore";

export type Theme = 'default' | 'warlock' | 'wizard' | 'druid' | 'warrior' | 'bard';

interface ThemeContextType {
  theme: Theme;
  setTheme: (newTheme: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { playerTheme, setPlayerTheme, userType, currentSession, username } = useSessionStore();
  const [theme, setThemeState] = useState<Theme>(playerTheme as Theme || "default");

  // On initial load, check if the user has a theme preference in the session
  useEffect(() => {
    if (userType === 'player' && currentSession && username) {
      const playerData = currentSession.players.find(p => p.name === username);
      if (playerData?.theme && Object.keys(themes).includes(playerData.theme)) {
        setThemeState(playerData.theme as Theme);
      } else if (playerTheme && Object.keys(themes).includes(playerTheme)) {
        setThemeState(playerTheme as Theme);
      }
    } else {
      // If not a player in a session, check localStorage
      const storedTheme = localStorage.getItem("theme") as Theme;
      if (storedTheme && Object.keys(themes).includes(storedTheme)) {
        setThemeState(storedTheme);
      }
    }
  }, [userType, currentSession, username, playerTheme]);

  // Update theme in Zustand store and apply to UI
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    setPlayerTheme(newTheme);
    
    // Store in localStorage regardless of the user type
    localStorage.setItem("theme", newTheme);
  };

  // Apply the theme whenever it changes
  useEffect(() => {
    // Применение темы при изменении
    applyTheme(theme);
  }, [theme]);

  const applyTheme = (themeName: Theme) => {
    const body = document.body;
    
    // Удаляем все предыдущие классы тем
    Object.keys(themes).forEach(key => {
      body.classList.remove(`theme-${key}`);
    });
    
    // Добавляем новый класс темы
    body.classList.add(`theme-${themeName}`);
    
    // Обновляем глобальную переменную темы
    document.documentElement.setAttribute('data-theme', themeName);

    // Применяем CSS переменные из темы
    const selectedTheme = themes[themeName];
    if (selectedTheme) {
      // Основные цвета темы
      document.documentElement.style.setProperty('--primary-gradient', selectedTheme.primary);
      document.documentElement.style.setProperty('--secondary-gradient', selectedTheme.secondary);
      document.documentElement.style.setProperty('--accent-color', selectedTheme.accent);
      document.documentElement.style.setProperty('--glow-effect', selectedTheme.glow);
      document.documentElement.style.setProperty('--text-color', selectedTheme.textColor);
      document.documentElement.style.setProperty('--contrast-color', selectedTheme.contrastColor);
      document.documentElement.style.setProperty('--muted-text-color', selectedTheme.mutedTextColor);
      
      // Фон для всех страниц, учитывая тему
      document.documentElement.style.setProperty('--background-color', themeName === 'default' ? '#1A1105' : '#0A0A0A');
      document.documentElement.style.setProperty('--background-card', 'rgba(0, 0, 0, 0.8)');
      
      // Цвета текста и акцента для всего приложения
      document.documentElement.style.setProperty('--theme-bg', themeName === 'default' ? '#1A1105' : '#0A0A0A');
      document.documentElement.style.setProperty('--theme-fg', selectedTheme.textColor);
      document.documentElement.style.setProperty('--theme-accent', selectedTheme.accent);
      
      // Основные цвета Tailwind для приложения
      document.documentElement.style.setProperty('--background', themeName === 'default' ? '26 10% 5%' : '0 0% 5%');
      document.documentElement.style.setProperty('--foreground', '0 0% 98%');
      document.documentElement.style.setProperty('--card', '0 0% 3%');
      document.documentElement.style.setProperty('--card-foreground', '0 0% 98%');
      document.documentElement.style.setProperty('--primary', selectedTheme.accent.replace('#', ''));
      document.documentElement.style.setProperty('--primary-foreground', '0 0% 98%');
      
      // Обеспечиваем читабельность на всех страницах
      document.body.style.backgroundColor = themeName === 'default' ? '#1A1105' : '#0A0A0A';
      document.body.style.color = selectedTheme.textColor;
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
