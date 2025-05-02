
import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
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

  const themeIcons = {
    'default': <Dices className="h-4 w-4 mr-1" />,
    'warlock': <Sparkles className="h-4 w-4 mr-1" />,
    'wizard': <Wand className="h-4 w-4 mr-1" />,
    'druid': <Leaf className="h-4 w-4 mr-1" />,
    'warrior': <Sword className="h-4 w-4 mr-1" />,
    'bard': <Feather className="h-4 w-4 mr-1" />
  };

  // Мобильная версия с дропдаун-меню
  if (isMobile) {
    return (
      <div className="flex flex-col items-center gap-2">
        <label className="text-sm font-semibold text-foreground">Тема:</label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 w-full">
              {themeIcons[theme as keyof typeof themeIcons]}
              {themes[theme].name}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-56 bg-popover">
            {Object.entries(themes).map(([key, value]) => (
              <DropdownMenuItem
                key={key}
                onClick={() => setTheme(key as any)}
                className="flex items-center gap-2"
              >
                {themeIcons[key as keyof typeof themeIcons]}
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
      <label className="text-sm font-semibold text-foreground">Выберите тему:</label>
      <div className="flex flex-wrap gap-1 justify-center">
        {Object.entries(themes).map(([key, value]) => (
          <Button
            key={key}
            variant={theme === key ? "default" : "outline"}
            size="sm"
            onClick={() => setTheme(key as any)}
            className={`flex items-center ${theme === key ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground'}`}
          >
            {themeIcons[key as keyof typeof themeIcons]}
            {value.name}
          </Button>
        ))}
      </div>
      
      <div className="mt-2">
        <Badge className="bg-primary text-primary-foreground">
          {themes[theme].name}
        </Badge>
      </div>
    </div>
  );
};

export default ThemeSelector;
