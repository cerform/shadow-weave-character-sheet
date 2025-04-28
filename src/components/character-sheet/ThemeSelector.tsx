
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme, Theme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

export const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();

  return (
    <Select value={theme} onValueChange={(value) => setTheme(value as Theme)}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Выберите тему" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(themes).map(([key, value]) => (
          <SelectItem key={key} value={key as Theme}>{value.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
