
import React from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Paintbrush } from "lucide-react";
import { useUserTheme } from '@/hooks/use-user-theme';
import { themes } from '@/lib/themes';

export const ThemeSelector = () => {
  const { setUserTheme, activeTheme } = useUserTheme();
  
  // Получаем список тем в формате массива объектов
  const themesList = [
    { name: "default", label: "По умолчанию" },
    { name: "warlock", label: "Чернокнижник" },
    { name: "wizard", label: "Волшебник" },
    { name: "druid", label: "Друид" },
    { name: "warrior", label: "Воин" },
    { name: "bard", label: "Бард" },
  ];

  // Получаем текущую тему из темы пользователя
  const themeKey = (activeTheme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
          style={{ borderColor: currentTheme.accent }}
        >
          <Paintbrush className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
          <span className="sr-only">Изменить тему</span>
          <div 
            className="absolute bottom-0 right-0 h-2 w-2 rounded-full" 
            style={{ backgroundColor: currentTheme.accent }}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end"
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          borderColor: currentTheme.accent 
        }}
      >
        {themesList.map((theme) => {
          // Получаем цвета для каждой темы
          const themeColor = themes[theme.name as keyof typeof themes]?.accent || themes.default.accent;
          
          return (
            <DropdownMenuItem
              key={theme.name}
              onClick={() => setUserTheme(theme.name)}
              className={activeTheme === theme.name ? "bg-primary/20" : ""}
              style={{ 
                borderLeft: activeTheme === theme.name ? `3px solid ${themeColor}` : '',
                paddingLeft: activeTheme === theme.name ? '13px' : ''
              }}
            >
              <div className="flex items-center gap-2">
                <div 
                  className="h-3 w-3 rounded-full" 
                  style={{ backgroundColor: themeColor }}
                />
                {theme.label} {activeTheme === theme.name && '✓'}
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSelector;
