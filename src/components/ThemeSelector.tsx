
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
  const { theme, setTheme } = useTheme();
  
  // Получаем список тем в формате массива объектов
  const themesList = useMemo(() => [
    { name: "default", label: "По умолчанию" },
    { name: "warlock", label: "Чернокнижник" },
    { name: "wizard", label: "Волшебник" },
    { name: "druid", label: "Друид" },
    { name: "warrior", label: "Воин" },
    { name: "bard", label: "Бард" },
  ], []);

  // Получаем текущую тему из контекстов и определяем стили
  const currentThemeId = useMemo(() => activeTheme || theme || 'default', [activeTheme, theme]);
  const currentTheme = useMemo(() => themes[currentThemeId as keyof typeof themes] || themes.default, [currentThemeId]);
  
  // Синхронизируем темы между контекстами при инициализации
  useEffect(() => {
    if (activeTheme && theme !== activeTheme) {
      setTheme(activeTheme);
      // Явно применяем CSS-переменные
      applyThemeToDom(activeTheme);
    }
  }, []);
  
  // Функция для применения темы к DOM
  const applyThemeToDom = useCallback((themeName: string) => {
    const selectedTheme = themes[themeName as keyof typeof themes] || themes.default;
    
    document.documentElement.setAttribute('data-theme', themeName);
    document.body.className = '';
    document.body.classList.add(`theme-${themeName}`);
    
    // Установка CSS-переменных
    document.documentElement.style.setProperty('--background', selectedTheme.background);
    document.documentElement.style.setProperty('--foreground', selectedTheme.foreground);
    document.documentElement.style.setProperty('--primary', selectedTheme.primary);
    document.documentElement.style.setProperty('--accent', selectedTheme.accent);
    document.documentElement.style.setProperty('--text', selectedTheme.textColor);
    document.documentElement.style.setProperty('--card-bg', selectedTheme.cardBackground);
    
    console.log('Тема применена к DOM:', themeName);
  }, []);

  // Обработчик переключения тем
  const handleThemeChange = useCallback((themeName: string) => {
    if (themeName === currentThemeId) return;
    
    setUserTheme(themeName);
    setTheme(themeName);
    
    // Применяем тему к DOM
    applyThemeToDom(themeName);
    
    // Сохраняем в localStorage
    localStorage.setItem('theme', themeName);
    localStorage.setItem('userTheme', themeName);
    localStorage.setItem('dnd-theme', themeName);
    
    console.log('Тема изменена на:', themeName);
  }, [currentThemeId, setUserTheme, setTheme, applyThemeToDom]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
          style={{ 
            borderColor: currentTheme.accent,
            backgroundColor: 'rgba(0, 0, 0, 0.7)'
          }}
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
          borderColor: currentTheme.accent,
          color: currentTheme.textColor
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
                color: currentTheme.textColor,
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
