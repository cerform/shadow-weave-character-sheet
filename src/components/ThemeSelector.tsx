
import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { themes } from "@/lib/themes";
import { Badge } from "@/components/ui/badge";
import { Dices, Sparkles, Wand, Leaf, Sword, Feather } from "lucide-react";
import { Button } from "@/components/ui/button";

const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();

  const themeIcons = {
    'default': <Dices className="h-4 w-4 mr-1" />,
    'warlock': <Sparkles className="h-4 w-4 mr-1" />,
    'wizard': <Wand className="h-4 w-4 mr-1" />,
    'druid': <Leaf className="h-4 w-4 mr-1" />,
    'warrior': <Sword className="h-4 w-4 mr-1" />,
    'bard': <Feather className="h-4 w-4 mr-1" />
  };

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
