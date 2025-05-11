
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
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

export const ThemeSelector = () => {
  const { setUserTheme, activeTheme } = useUserTheme();
  const { theme, setTheme, themeStyles } = useTheme();
  
  // Получаем список тем в формате массива объектов
  const themesList = useMemo(() => [
    { name: "default", label: "По умолчанию" },
    { name: "warlock", label: "Чернокнижник" },
    { name: "wizard", label: "Волшебник" },
    { name: "druid", label: "Друид" },
    { name: "warrior", label: "Воин" },
    { name: "bard", label: "Бард" },
  ], []);

  // Получаем текущую тему из контекстов - мемоизируем для предотвращения мерцания
  const currentThemeId = useMemo(() => activeTheme || theme || 'default', [activeTheme, theme]);
  const currentTheme = useMemo(() => themeStyles || themes[currentThemeId as keyof typeof themes] || themes.default, [themeStyles, currentThemeId]);
  
  // Кешируем стили для предотвращения мерцания
  const accentColor = useMemo(() => currentTheme.accent, [currentTheme]);
  
  // Синхронизируем темы между контекстами при инициализации - только один раз
  useEffect(() => {
    if (activeTheme && theme !== activeTheme) {
      setTheme(activeTheme);
    }
  }, []); // Запускаем только при монтировании

  // Обработчик переключения тем - мемоизируем для стабильности
  const handleThemeChange = useCallback((themeName: string) => {
    // Чтобы избежать лишних ререндеров, проверяем, нужно ли обновлять тему
    if (themeName === currentThemeId) return;
    
    // Обновляем темы в обоих контекстах только если они изменились
    setUserTheme(themeName);
    setTheme(themeName);
    
    // Сохраняем в localStorage
    localStorage.setItem('theme', themeName);
    localStorage.setItem('userTheme', themeName);
    localStorage.setItem('dnd-theme', themeName);
    
    console.log('Switching theme to:', themeName);
  }, [currentThemeId, setUserTheme, setTheme]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
          style={{ borderColor: accentColor }}
        >
          <Paintbrush className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
          <span className="sr-only">Изменить тему</span>
          <div 
            className="absolute bottom-0 right-0 h-2 w-2 rounded-full" 
            style={{ backgroundColor: accentColor }}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end"
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          borderColor: accentColor 
        }}
      >
        {themesList.map((themeItem) => {
          // Получаем цвета для каждой темы - кешируем для избежания мерцания
          const themeColor = themes[themeItem.name as keyof typeof themes]?.accent || themes.default.accent;
          const isActive = currentThemeId === themeItem.name;
          
          return (
            <DropdownMenuItem
              key={themeItem.name}
              onClick={() => handleThemeChange(themeItem.name)}
              className={isActive ? "bg-primary/20" : ""}
              style={{ 
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
