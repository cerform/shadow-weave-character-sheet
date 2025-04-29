
import React from 'react';
import { useTheme } from '@/hooks/use-theme';
import { Button } from "@/components/ui/button";

export const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();
  
  const themes = [
    { id: 'default', name: 'Стандартная' },
    { id: 'warlock', name: 'Чернокнижник' },
    { id: 'wizard', name: 'Волшебник' },
    { id: 'druid', name: 'Друид' },
    { id: 'warrior', name: 'Воин' },
    { id: 'bard', name: 'Бард' }
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
          >
            {t.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSelector;
