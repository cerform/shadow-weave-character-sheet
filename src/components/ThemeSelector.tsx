
import React from "react";
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";
import { Badge } from "@/components/ui/badge";
import { Dices, Sparkles, Wand, Leaf, Sword, Feather, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();
  
  // Добавляем защиту от undefined
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  const themeIcons = {
    'default': <Dices className="h-4 w-4 mr-1" />,
    'warlock': <Sparkles className="h-4 w-4 mr-1" />,
    'wizard': <Wand className="h-4 w-4 mr-1" />,
    'druid': <Leaf className="h-4 w-4 mr-1" />,
    'warrior': <Sword className="h-4 w-4 mr-1" />,
    'bard': <Feather className="h-4 w-4 mr-1" />
  };

  // Стили для кнопок на основе текущей темы
  const buttonStyle = {
    color: currentTheme.buttonText || '#FFFFFF',
    borderColor: currentTheme.accent,
  };

  const selectedButtonStyle = {
    backgroundColor: currentTheme.accent,
    color: currentTheme.buttonText || '#FFFFFF',
  };

  // Мобильная версия с дропдаун-меню
  if (isMobile) {
    return (
      <div className="flex flex-col items-center gap-2">
        <label className="text-sm font-semibold" style={{color: currentTheme.textColor}}>Тема:</label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 w-full"
              style={buttonStyle}
            >
              {themeIcons[themeKey] || <Dices className="h-4 w-4 mr-1" />}
              {currentTheme?.name || "Стандартная"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="center" 
            className="w-56 bg-black/90 border-accent"
            style={{
              backgroundColor: `${currentTheme.cardBackground || 'rgba(0, 0, 0, 0.9)'}`,
              borderColor: currentTheme.accent,
            }}
          >
            {Object.entries(themes).map(([key, value]) => (
              <DropdownMenuItem
                key={key}
                onClick={() => setTheme(key as any)}
                className="flex items-center gap-2"
                style={{color: currentTheme.textColor}}
              >
                {themeIcons[key as keyof typeof themeIcons] || <Dices className="h-4 w-4 mr-1" />}
                <span>{value.name}</span>
                {theme === key && <Check className="h-4 w-4 ml-auto" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  // Десктопная версия с кнопками
  return (
    <div className="flex flex-col items-center gap-2">
      <label className="text-sm font-semibold" style={{color: currentTheme.textColor}}>Выберите тему:</label>
      <div className="flex flex-wrap gap-1 justify-center">
        {Object.entries(themes).map(([key, value]) => (
          <Button
            key={key}
            variant={theme === key ? "default" : "outline"}
            size="sm"
            onClick={() => setTheme(key as any)}
            className={`flex items-center ${theme === key ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground'}`}
            style={theme === key ? selectedButtonStyle : buttonStyle}
          >
            {themeIcons[key as keyof typeof themeIcons] || <Dices className="h-4 w-4 mr-1" />}
            {value.name}
          </Button>
        ))}
      </div>
      
      <div className="mt-2">
        <Badge 
          className="bg-primary text-primary-foreground"
          style={{
            backgroundColor: currentTheme.accent,
            color: currentTheme.buttonText || '#FFFFFF',
          }}
        >
          {currentTheme?.name || "Стандартная"}
        </Badge>
      </div>
    </div>
  );
};

export default ThemeSelector;
