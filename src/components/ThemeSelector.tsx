
import React from 'react';
import { useTheme, ThemeType } from '@/hooks/use-theme';
import { Button } from './ui/button';
import { Moon, Sun, Palette, Wand } from 'lucide-react';

const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();

  const themes: { id: ThemeType; name: string; icon: React.ReactNode }[] = [
    { id: 'light', name: 'Светлая', icon: <Sun className="h-4 w-4" /> },
    { id: 'dark', name: 'Тёмная', icon: <Moon className="h-4 w-4" /> },
    { id: 'wizard', name: 'Волшебник', icon: <Wand className="h-4 w-4" /> },
    { id: 'warlock', name: 'Колдун', icon: <Palette className="h-4 w-4" /> },
  ];

  const handleThemeChange = (newTheme: ThemeType) => {
    console.log('Changing theme to:', newTheme);
    setTheme(newTheme);
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Тема оформления</h3>
      <div className="flex flex-wrap gap-2">
        {themes.map((t) => (
          <Button
            key={t.id}
            size="sm"
            variant={theme === t.id ? 'default' : 'outline'}
            className="flex items-center gap-1"
            onClick={() => handleThemeChange(t.id)}
          >
            {t.icon}
            <span>{t.name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSelector;
