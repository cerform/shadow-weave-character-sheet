
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from '@/hooks/use-theme';

export const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();

  return (
    <Select value={theme} onValueChange={setTheme}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Выберите тему" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="shadow">Стандартный</SelectItem>
        <SelectItem value="fire">Колдун (Фиолетовый)</SelectItem>
        <SelectItem value="arcane">Волшебник (Синий)</SelectItem>
        <SelectItem value="barbarian">Варвар (Красный)</SelectItem>
        <SelectItem value="nature">Друид (Зеленый)</SelectItem>
        <SelectItem value="bard">Бард (Золотой)</SelectItem>
      </SelectContent>
    </Select>
  );
};
