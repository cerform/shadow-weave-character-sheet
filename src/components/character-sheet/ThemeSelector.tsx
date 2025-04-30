
import React from 'react';
import { useTheme } from '@/hooks/use-theme';
import { Button } from "@/components/ui/button";
import { Leaf, Sword, Wand } from "lucide-react";

export const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();
  
  const themes = [
    { id: 'default', name: 'Стандартная', icon: null },
    { id: 'warlock', name: 'Чернокнижник', icon: null },
    { id: 'wizard', name: 'Волшебник', icon: <Wand className="h-4 w-4 mr-1" /> },
    { id: 'druid', name: 'Друид', icon: <Leaf className="h-4 w-4 mr-1" /> },
    { id: 'warrior', name: 'Воин', icon: <Sword className="h-4 w-4 mr-1" /> },
    { id: 'bard', name: 'Бард', icon: null }
  ];
  
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme as any);
    localStorage.setItem('theme', newTheme);
  };
  
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Тема оформления</p>
      <div className="flex flex-wrap gap-2">
        {themes.map((t) => (
          <Button 
            key={t.id}
            variant={theme === t.id ? "default" : "outline"} 
            size="sm"
            onClick={() => handleThemeChange(t.id)}
            className="flex items-center"
          >
            {t.icon}
            {t.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSelector;
