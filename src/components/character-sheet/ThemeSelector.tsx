
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from '@/contexts/ThemeContext';

// Темы и их описания
const themes = {
  'shadow-magic': {
    name: '🧙‍♂️ Теневая Магия',
    description: 'Тёмные тона с красным и фиолетовым свечением'
  },
  'ice-storm': {
    name: '❄️ Ледяная Буря',
    description: 'Синие и голубые оттенки с холодным сиянием'
  },
  'wild-nature': {
    name: '🌿 Дикая Природа', 
    description: 'Зелёные и жёлтые оттенки природных сил'
  },
  'tavern': {
    name: '🍺 Таверна',
    description: 'Уютные коричневые тона средневековой таверны'
  },
  'deep-ocean': {
    name: '🌊 Глубины Океана',
    description: 'Глубокие синие и янтарные цвета морских глубин'
  }
};

export const ThemeSelector = () => {
  const { theme, switchTheme } = useTheme();

  return (
    <Select value={theme} onValueChange={(value) => switchTheme(value as any)}>
      <SelectTrigger className="w-[220px] bg-background/50 border-primary/50">
        <SelectValue placeholder="Выберите тему" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(themes).map(([key, value]) => (
          <SelectItem key={key} value={key}>
            <div className="flex items-center">
              <span className="mr-2">{value.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ThemeSelector;
