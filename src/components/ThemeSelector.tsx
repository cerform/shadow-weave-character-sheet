
import React from "react";
import { useTheme } from "@/hooks/use-theme";
import { useUserTheme } from "@/hooks/use-user-theme";
import { themes } from "@/lib/themes";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ThemeSelector = () => {
  const { theme } = useTheme();
  const { activeTheme, setUserTheme } = useUserTheme();
  
  // Используем активную тему из UserThemeContext с запасным вариантом из ThemeContext
  const themeKey = (activeTheme || theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  const themesList = [
    { id: 'default', name: 'Стандартная' },
    { id: 'warlock', name: 'Чернокнижник' },
    { id: 'wizard', name: 'Волшебник' },
    { id: 'druid', name: 'Друид' },
    { id: 'warrior', name: 'Воин' },
    { id: 'bard', name: 'Бард' }
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="relative"
          style={{ 
            borderColor: currentTheme.accent,
            color: currentTheme.textColor,
            backgroundColor: 'rgba(0, 0, 0, 0.7)'
          }}
        >
          <Palette className="h-5 w-5" />
          <span className="sr-only">Сменить тему</span>
          <span 
            className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full" 
            style={{ backgroundColor: currentTheme.accent }}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="min-w-[12rem]" 
        style={{ 
          backgroundColor: currentTheme.cardBackground || 'rgba(0, 0, 0, 0.85)',
          borderColor: currentTheme.accent,
          color: currentTheme.textColor
        }}
      >
        <DropdownMenuLabel 
          style={{ color: currentTheme.textColor }}
        >
          Выберите тему
        </DropdownMenuLabel>
        <DropdownMenuSeparator style={{ backgroundColor: `${currentTheme.accent}50` }} />
        {themesList.map((item) => {
          // Получаем цвет для текущей темы в списке
          const themeColor = themes[item.id as keyof typeof themes]?.accent || themes.default.accent;
          const isActive = activeTheme === item.id || (!activeTheme && theme === item.id);
          
          return (
            <DropdownMenuItem 
              key={item.id} 
              onClick={() => setUserTheme(item.id)} 
              className="flex items-center justify-between cursor-pointer"
              style={{
                color: currentTheme.textColor,
                backgroundColor: isActive ? `${currentTheme.accent}20` : 'transparent',
                borderLeft: isActive ? `3px solid ${themeColor}` : '',
                paddingLeft: isActive ? '13px' : ''
              }}
            >
              <div className="flex items-center gap-2">
                <span 
                  className="flex items-center justify-center h-4 w-4 rounded-full" 
                  style={{ 
                    backgroundColor: themeColor,
                  }}
                />
                <span>{item.name}</span>
              </div>
              {isActive && (
                <span className="text-sm">✓</span>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSelector;
