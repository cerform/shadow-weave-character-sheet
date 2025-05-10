
import React, { useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { ThemeType } from "@/types/theme";

const ThemeToggle = () => {
  // Получаем тему и функцию для ее изменения из контекста
  const { theme, setTheme } = useTheme();
  
  // Определяем, какая тема активна сейчас
  const isDarkTheme = theme === 'dark' || theme === 'warlock' || theme === 'wizard';
  
  // На основе текущей темы определяем, на какую переключаться
  const toggleTheme = () => {
    if (isDarkTheme) {
      // Если тема темная, переключаемся на светлую
      setTheme('light' as ThemeType);
    } else {
      // Если тема светлая, переключаемся на темную
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
