
import React from 'react';
import { useTheme } from '@/hooks/use-theme';
import { useUserTheme } from '@/hooks/use-user-theme';
import { themes } from '@/lib/themes';
import { ThemeType } from '@/types/theme';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Paintbrush, Check } from "lucide-react";

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { setUserTheme } = useUserTheme();
  const currentThemeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[currentThemeKey] || themes.default;
  
  const themeOptions = [
    { name: 'default' as ThemeType, label: 'По умолчанию' },
    { name: 'warlock' as ThemeType, label: 'Колдун' },
    { name: 'wizard' as ThemeType, label: 'Волшебник' },
    { name: 'druid' as ThemeType, label: 'Друид' },
    { name: 'warrior' as ThemeType, label: 'Воин' },
    { name: 'bard' as ThemeType, label: 'Бард' },
    { name: 'monk' as ThemeType, label: 'Монах' },
    { name: 'ranger' as ThemeType, label: 'Следопыт' },
    { name: 'sorcerer' as ThemeType, label: 'Чародей' },
  ];
  
  const handleThemeChange = (themeName: ThemeType) => {
    setTheme(themeName);
    setUserTheme(themeName);
    
    // Сохраняем тему в localStorage
    localStorage.setItem('theme', themeName.toString());
    localStorage.setItem('userTheme', themeName.toString());
    localStorage.setItem('dnd-theme', themeName.toString());
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Paintbrush className="h-5 w-5" style={{ color: currentTheme.accent }} />
          <span className="sr-only">Выбрать тему</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Выберите тему</DropdownMenuLabel>
        {themeOptions.map((option) => {
          const themeColor = themes[option.name as keyof typeof themes]?.accent || themes.default.accent;
          const isActive = theme === option.name;
          
          return (
            <DropdownMenuItem
              key={option.name}
              onClick={() => handleThemeChange(option.name)}
              className="flex items-center gap-2"
            >
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: themeColor }} />
              <span>{option.label}</span>
              {isActive && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeToggle;
