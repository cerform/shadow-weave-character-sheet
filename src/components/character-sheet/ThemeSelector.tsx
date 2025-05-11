
import React, { useMemo } from 'react';
import { useTheme, ThemeType } from '@/hooks/use-theme';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { themes } from '@/lib/themes';

const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();
  
  const themeOptions = useMemo(() => {
    return Object.keys(themes).map((key) => {
      const themeKey = key as keyof typeof themes;
      const themeName = themes[themeKey]?.name || key;
      return { 
        id: key as ThemeType,
        name: themeName
      };
    });
  }, []);
  
  const handleThemeChange = (newTheme: ThemeType) => {
    console.log('Changing theme to:', newTheme);
    setTheme(newTheme);
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Тема оформления</h3>
      <Select value={theme} onValueChange={(value) => handleThemeChange(value as ThemeType)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Выберите тему" />
        </SelectTrigger>
        <SelectContent>
          {themeOptions.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              {t.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ThemeSelector;
