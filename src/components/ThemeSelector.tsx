
import React, { useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import { useUserTheme } from "@/hooks/use-user-theme";
import { themes, ThemeName } from "@/lib/themes";
import { Button } from "@/components/ui/button";
import { useDeviceType } from "@/hooks/use-mobile";
import { Check, PaintBucket, Palette, Sparkles, Wand, Leaf, Sword, Music, Book, Castle, Dragon, Moon, Sun } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu";

const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();
  const { activeTheme, setUserTheme } = useUserTheme();
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';
  const [hoveredTheme, setHoveredTheme] = useState<ThemeName | null>(null);
  
  // Используем активную тему из UserThemeContext с запасным вариантом из ThemeContext
  const themeKey = (activeTheme || theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  // Расширенный список тем с иконками
  const themesList = [
    { id: 'default', name: 'Стандартная', icon: <PaintBucket size={16} />, group: 'base' },
    { id: 'warlock', name: 'Чернокнижник', icon: <Sparkles size={16} />, group: 'class' },
    { id: 'wizard', name: 'Волшебник', icon: <Wand size={16} />, group: 'class' },
    { id: 'druid', name: 'Друид', icon: <Leaf size={16} />, group: 'class' },
    { id: 'warrior', name: 'Воин', icon: <Sword size={16} />, group: 'class' },
    { id: 'bard', name: 'Бард', icon: <Music size={16} />, group: 'class' },
    { id: 'parchment', name: 'Пергамент', icon: <Book size={16} />, group: 'world' },
    { id: 'dungeon', name: 'Подземелье', icon: <Castle size={16} />, group: 'world' },
    { id: 'infernal', name: 'Инфернальная', icon: <Dragon size={16} />, group: 'world' },
    { id: 'celestial', name: 'Небесная', icon: <Sun size={16} />, group: 'world' },
    { id: 'dark', name: 'Тёмная', icon: <Moon size={16} />, group: 'base' }
  ];

  // Группировка тем для более удобного выбора
  const themeGroups = {
    base: "Основные",
    class: "Классы",
    world: "Миры"
  };

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

  // Получение предпросмотра темы при наведении
  const getPreviewStyle = (themeId: ThemeName) => {
    const previewTheme = themes[themeId];
    return {
      background: `linear-gradient(135deg, ${previewTheme.accent}40, ${previewTheme.primary}40)`,
      border: `1px solid ${previewTheme.accent}`,
      boxShadow: previewTheme.glow || '0 0 5px rgba(0, 0, 0, 0.2)'
    };
  };

  return (
    <DropdownMenu onOpenChange={() => setHoveredTheme(null)}>
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
          <Palette className="h-5 w-5 animate-glow" />
          <span className="sr-only">Сменить тему</span>
          <span 
            className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full" 
            style={{ backgroundColor: currentTheme.accent }}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="min-w-[16rem] max-h-[400px] overflow-y-auto" 
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
        
        {/* Группируем темы по категориям */}
        {Object.entries(themeGroups).map(([groupKey, groupLabel]) => (
          <DropdownMenuGroup key={groupKey}>
            <DropdownMenuLabel
              className="text-xs pt-2"
              style={{ color: `${currentTheme.accent}`, opacity: 0.8 }}
            >
              {groupLabel}
            </DropdownMenuLabel>
            
            {themesList
              .filter(item => item.group === groupKey)
              .map((themeItem) => {
                // Получаем цвета для текущей темы в списке
                const themeId = themeItem.id as ThemeName;
                const themeColor = themes[themeId]?.accent || themes.default.accent;
                const isActive = activeTheme === themeId || (!activeTheme && theme === themeId);
                const isHovered = hoveredTheme === themeId;
                
                return (
                  <DropdownMenuItem 
                    key={themeId} 
                    onClick={() => handleThemeChange(themeId)} 
                    onMouseEnter={() => setHoveredTheme(themeId)}
                    onMouseLeave={() => setHoveredTheme(null)}
                    className="flex items-center justify-between cursor-pointer my-0.5 transition-all duration-200"
                    style={{
                      color: currentTheme.textColor,
                      backgroundColor: isActive 
                        ? `${currentTheme.accent}20` 
                        : isHovered 
                          ? `${themes[themeId].accent}10` 
                          : 'transparent',
                      borderLeft: isActive ? `3px solid ${themeColor}` : '',
                      paddingLeft: isActive ? '13px' : '',
                      ...(isHovered ? getPreviewStyle(themeId) : {}),
                      transform: isHovered ? 'translateX(2px)' : 'none'
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span 
                        className="flex items-center justify-center h-5 w-5 rounded-full transition-all duration-200" 
                        style={{ 
                          backgroundColor: isActive ? themeColor : 'transparent',
                          color: isActive ? '#000' : themeColor,
                          boxShadow: isActive 
                            ? `0 0 5px ${themeColor}` 
                            : isHovered 
                              ? `0 0 3px ${themeColor}50` 
                              : 'none'
                        }}
                      >
                        {themeItem.icon}
                      </span>
                      <span 
                        className="transition-all"
                        style={{
                          fontWeight: isActive || isHovered ? 600 : 400,
                          textShadow: isHovered ? `0 0 1px ${themeColor}50` : 'none'
                        }}
                      >
                        {themeItem.name}
                      </span>
                    </div>
                    {isActive && (
                      <Check 
                        size={16} 
                        style={{ 
                          color: currentTheme.accent,
                          filter: `drop-shadow(0 0 2px ${currentTheme.accent}70)`
                        }} 
                      />
                    )}
                  </DropdownMenuItem>
                );
              })}
          </DropdownMenuGroup>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSelector;
