
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from "@/components/ui/button";
import { Leaf, Sword, Wand, Feather, Sparkles, Dices } from "lucide-react";
import { themes } from "@/lib/themes";

export const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();
  
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
              <span>{themes[themeId as keyof typeof themes].name}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default ThemeSelector;
