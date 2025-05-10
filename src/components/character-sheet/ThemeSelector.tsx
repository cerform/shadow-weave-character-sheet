
import React from 'react';
import { themes } from '@/lib/themes';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';
import { ThemeType } from '@/types/theme';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PaintBucket } from 'lucide-react';

const ThemeSelector: React.FC = () => {
  const { currentTheme, setTheme, theme } = useTheme();
  
  const handleThemeChange = (themeKey: ThemeType) => {
    setTheme(themeKey);
  };
  
  const getThemeName = (themeKey: string): string => {
    switch(themeKey) {
      case 'default': return 'Стандартная';
      case 'dark': return 'Тёмная';
      case 'light': return 'Светлая';
      case 'red': return 'Красная';
      case 'green': return 'Зелёная';
      case 'blue': return 'Синяя';
      case 'purple': return 'Фиолетовая';
      case 'orange': return 'Оранжевая';
      case 'yellow': return 'Жёлтая';
      case 'pink': return 'Розовая';
      case 'gray': return 'Серая';
      case 'system': return 'Системная';
      default: return themeKey;
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <PaintBucket className="h-4 w-4" />
          <span className="sr-only">Сменить тему</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.keys(themes).map((themeKey) => (
          <DropdownMenuItem
            key={themeKey}
            onClick={() => handleThemeChange(themeKey as ThemeType)}
            className="cursor-pointer"
            style={{
              backgroundColor: theme === themeKey ? '#f4f4f5' : 'transparent',
            }}
          >
            <div className="flex items-center">
              <div
                className="h-4 w-4 rounded-full mr-2"
                style={{
                  backgroundColor: themes[themeKey as keyof typeof themes].primary,
                }}
              />
              {getThemeName(themeKey)}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSelector;
