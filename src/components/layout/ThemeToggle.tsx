
import React from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme, ThemeType } from "@/hooks/use-theme";

const ThemeToggle = () => {
  // Получаем тему и функцию для ее изменения из контекста
  const { theme, setTheme } = useTheme();
  
  // Определяем, какая тема активна сейчас
  const isDarkTheme = theme === 'dark' || theme === 'warlock' || theme === 'wizard';
  
  // На основе текущей темы определяем, на какую переключаться
  const toggleTheme = () => {
    console.log('Toggle theme from', theme);
    if (isDarkTheme) {
      // If theme is dark, switch to light theme
      setTheme('light' as ThemeType);
    } else {
      // If theme is light, switch to dark theme
      setTheme('dark' as ThemeType);
    }
  };
  
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      aria-label="Toggle theme"
      onClick={toggleTheme}
      className="rounded-full"
    >
      {isDarkTheme ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
};

export default ThemeToggle;
