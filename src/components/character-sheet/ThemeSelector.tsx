
import React from 'react';
import { useTheme } from '@/hooks/use-theme';
import { Button } from "@/components/ui/button";
import { Leaf, Sword, Wand, Feather, Sparkles, Dices, Check } from "lucide-react";
import { themes } from "@/lib/themes";
import { useIsMobile } from '@/hooks/use-mobile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();
  
  const themeIcons = {
    'default': <Dices className="h-4 w-4 mr-1" />,
    'warlock': <Sparkles className="h-4 w-4 mr-1" />,
    'wizard': <Wand className="h-4 w-4 mr-1" />,
    'druid': <Leaf className="h-4 w-4 mr-1" />,
    'warrior': <Sword className="h-4 w-4 mr-1" />,
    'bard': <Feather className="h-4 w-4 mr-1" />
  };
  
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme as any);
  };
  
  // Мобильная версия с дропдаун-меню
  if (isMobile) {
    const currentThemeObj = themes[theme as keyof typeof themes];
    
    return (
      <div className="space-y-2 flex flex-col items-center">
        <p className="text-sm font-medium" style={{ color: currentThemeObj.textColor }}>Тема</p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 w-full"
              style={{
                color: currentThemeObj.textColor,
                backgroundColor: `rgba(${currentThemeObj.accent}, 0.2)`,
                borderColor: currentThemeObj.accent
              }}
            >
              {themeIcons[theme as keyof typeof themeIcons]}
              {themes[theme].name}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-56" style={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(10px)',
            borderColor: currentThemeObj.accent
          }}>
            {Object.keys(themes).map((themeId) => {
              const themeObj = themes[themeId as keyof typeof themes];
              return (
                <DropdownMenuItem
                  key={themeId}
                  onClick={() => handleThemeChange(themeId)}
                  className="flex items-center gap-2"
                  style={{ color: themeObj.textColor }}
                >
                  {themeIcons[themeId as keyof typeof themeIcons]}
                  <span>{themeObj.name}</span>
                  {theme === themeId && <Check className="h-4 w-4 ml-auto" />}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }
  
  // Десктопная версия с кнопками
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium" style={{ color: themes[theme as keyof typeof themes].textColor }}>Тема оформления</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {Object.keys(themes).map((themeId) => {
          const currentThemeObj = themes[themeId as keyof typeof themes];
          const isSelected = theme === themeId;
            
          return (
            <Button 
              key={themeId}
              variant={isSelected ? "default" : "outline"} 
              size="sm"
              onClick={() => handleThemeChange(themeId)}
              style={{
                color: currentThemeObj.textColor,
                backgroundColor: isSelected 
                  ? `rgba(${currentThemeObj.accent}, 0.7)` 
                  : 'rgba(0, 0, 0, 0.2)',
                borderColor: currentThemeObj.accent
              }}
            >
              {themeIcons[themeId as keyof typeof themeIcons]}
              <span>{currentThemeObj.name}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default ThemeSelector;
