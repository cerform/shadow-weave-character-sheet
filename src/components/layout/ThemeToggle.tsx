
import React from 'react';
import { useTheme } from '@/hooks/use-theme';
import { useUserTheme } from '@/hooks/use-user-theme';
import { themes } from '@/lib/themes';
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
  const { theme, setTheme, themeStyles } = useTheme();
  const { setUserTheme } = useUserTheme();
  
  const themeOptions = [
    { name: 'default', label: 'По умолчанию' },
    { name: 'shadow', label: 'Колдун' },
    { name: 'frost', label: 'Волшебник' },
    { name: 'emerald', label: 'Друид' },
    { name: 'flame', label: 'Воин' },
    { name: 'mystic', label: 'Бард' },
    { name: 'steel', label: 'Монах' },
    { name: 'bronze', label: 'Следопыт' },
    { name: 'dark', label: 'Чародей' },
  ];
  
  const handleThemeChange = (themeName: string) => {
    setTheme(themeName);
    setUserTheme(themeName);
  };
  
  const currentAccent = themeStyles?.accent || themes.default.accent;
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Paintbrush className="h-5 w-5" style={{ color: currentAccent }} />
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
