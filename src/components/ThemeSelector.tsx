
import React from "react";
import { useTheme } from "@/hooks/use-theme";
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
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';
  
  // Добавляем защиту от undefined
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  const themesList = [
    { id: 'default', name: 'Стандартная', icon: <PaintBucket size={16} /> },
    { id: 'warlock', name: 'Чернокнижник', icon: <Sparkles size={16} /> },
    { id: 'wizard', name: 'Волшебник', icon: <Wand size={16} /> },
    { id: 'druid', name: 'Друид', icon: <Leaf size={16} /> },
    { id: 'warrior', name: 'Воин', icon: <Sword size={16} /> },
    { id: 'bard', name: 'Бард', icon: <Music size={16} /> },
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
            color: currentTheme.textColor
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
        }}
      >
        <DropdownMenuLabel 
          style={{ color: currentTheme.textColor }}
        >
          Выберите тему
        </DropdownMenuLabel>
        <DropdownMenuSeparator style={{ backgroundColor: `${currentTheme.accent}50` }} />
        {themesList.map((item) => (
          <DropdownMenuItem 
            key={item.id} 
            onClick={() => setTheme(item.id as any)} 
            className="flex items-center justify-between cursor-pointer"
            style={{
              color: currentTheme.textColor,
              backgroundColor: theme === item.id ? `${currentTheme.accent}20` : 'transparent'
            }}
          >
            <div className="flex items-center gap-2">
              <span 
                className="flex items-center justify-center h-5 w-5 rounded-full" 
                style={{ 
                  backgroundColor: theme === item.id ? currentTheme.accent : 'transparent',
                  color: theme === item.id ? currentTheme.buttonText : currentTheme.textColor
                }}
              >
                {item.icon}
              </span>
              <span>{item.name}</span>
            </div>
            {theme === item.id && (
              <Check size={16} style={{ color: currentTheme.accent }} />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSelector;
