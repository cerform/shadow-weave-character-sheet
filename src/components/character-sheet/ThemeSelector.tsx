
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from '@/contexts/ThemeContext';
import { themes } from '@/lib/themes';

export const ThemeSelector = () => {
  const { theme, switchTheme } = useTheme();

  return (
    <Select value={theme} onValueChange={(value) => switchTheme(value as any)}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Выберите тему" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(themes).map(([key, value]) => (
          <SelectItem key={key} value={key}>{value.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
