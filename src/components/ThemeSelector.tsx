
import React, { useEffect, useMemo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Paintbrush, Check } from "lucide-react";
import { useUserTheme } from '@/hooks/use-user-theme';
import { themes } from '@/lib/themes';

export const ThemeSelector = () => {
  const { activeTheme, setUserTheme, currentTheme } = useUserTheme();
  
  // Получаем список тем в формате массива объектов
  const themesList = useMemo(() => [
    { name: "default", label: "По умолчанию" },
    { name: "warlock", label: "Чернокнижник" },
    { name: "wizard", label: "Волшебник" },
    { name: "druid", label: "Друид" },
    { name: "warrior", label: "Воин" },
    { name: "bard", label: "Бард" },
  ], []);

  // Получаем текущую тему и определяем стили
  const currentThemeId = useMemo(() => activeTheme || 'default', [activeTheme]);
  const themeStyles = useMemo(() => currentTheme || themes[currentThemeId as keyof typeof themes] || themes.default, [currentTheme, currentThemeId]);

  // Обработчик переключения тем
  const handleThemeChange = useCallback((themeName: string) => {
    if (themeName === currentThemeId) return;
    
    setUserTheme(themeName);
    
    // Сохраняем в localStorage
    localStorage.setItem('theme', themeName);
    localStorage.setItem('userTheme', themeName);
    localStorage.setItem('dnd-theme', themeName);
    
    console.log('Тема изменена на:', themeName);
  }, [currentThemeId, setUserTheme]);
  
  // При загрузке проверяем текущую тему и применяем её
  useEffect(() => {
    console.log("ThemeSelector: текущая тема:", currentThemeId);
  }, [currentThemeId]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
          style={{ 
            borderColor: themeStyles.accent,
            backgroundColor: 'rgba(0, 0, 0, 0.7)'
          }}
        >
          <Paintbrush className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
          <span className="sr-only">Изменить тему</span>
          <div 
            className="absolute bottom-0 right-0 h-2 w-2 rounded-full" 
            style={{ backgroundColor: themeStyles.accent }}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end"
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          borderColor: themeStyles.accent,
          color: themeStyles.textColor
        }}
      >
        {themesList.map((themeItem) => {
          const themeColor = themes[themeItem.name as keyof typeof themes]?.accent || themes.default.accent;
          const isActive = currentThemeId === themeItem.name;
          
          return (
            <DropdownMenuItem
              key={themeItem.name}
              onClick={() => handleThemeChange(themeItem.name)}
              className={isActive ? "bg-primary/20" : ""}
              style={{ 
                color: themeStyles.textColor,
                borderLeft: isActive ? `3px solid ${themeColor}` : '',
                paddingLeft: isActive ? '13px' : ''
              }}
            >
              <div className="flex items-center gap-2">
                <div 
                  className="h-3 w-3 rounded-full" 
                  style={{ backgroundColor: themeColor }}
                />
                {themeItem.label} {isActive && <Check className="ml-2 h-3 w-3" />}
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSelector;
