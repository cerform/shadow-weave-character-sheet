
import React from "react";
import { useTheme } from "@/hooks/use-theme";
import { useUserTheme } from "@/hooks/use-user-theme";
import { themes } from "@/lib/themes";
import { Button } from "@/components/ui/button";
import { useDeviceType } from "@/hooks/use-mobile";
import { Check, PaintBucket, Palette, Sparkles, Wand, Leaf, Sword, Music } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();
  const { activeTheme, setUserTheme } = useUserTheme();
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';
  
  // Используем активную тему из UserThemeContext с запасным вариантом из ThemeContext
  const themeKey = (activeTheme || theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  const themesList = [
    { id: 'default', name: 'Стандартная', icon: <PaintBucket size={16} /> },
    { id: 'warlock', name: 'Чернокнижник', icon: <Sparkles size={16} /> },
    { id: 'wizard', name: 'Волшебник', icon: <Wand size={16} /> },
    { id: 'druid', name: 'Друид', icon: <Leaf size={16} /> },
    { id: 'warrior', name: 'Воин', icon: <Sword size={16} /> },
    { id: 'bard', name: 'Бард', icon: <Music size={16} /> },
  ];

  // Обработчик для изменения темы
  const handleThemeChange = (themeId: string) => {
    // Сначала установим тему в глобальном контексте
    if (setTheme) setTheme(themeId);
    
    // Затем установим тему в пользовательском контексте
    if (setUserTheme) setUserTheme(themeId);
    
    // Сохраняем тему в localStorage для обоих контекстов
    localStorage.setItem('theme', themeId);
    localStorage.setItem('userTheme', themeId);
    localStorage.setItem('dnd-theme', themeId);

    console.log('Theme changed to:', themeId);
  };

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
            boxShadow: `0 0 5px ${currentTheme.accent}30`,
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
          boxShadow: currentTheme.glow || '0 0 5px rgba(0, 0, 0, 0.5)',
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
              onClick={() => handleThemeChange(item.id)} 
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
                  className="flex items-center justify-center h-5 w-5 rounded-full" 
                  style={{ 
                    backgroundColor: isActive ? themeColor : 'transparent',
                    color: isActive ? '#000' : themeColor,
                    boxShadow: isActive ? `0 0 5px ${themeColor}` : 'none'
                  }}
                >
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </div>
              {isActive && (
                <Check size={16} style={{ color: currentTheme.accent }} />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSelector;
