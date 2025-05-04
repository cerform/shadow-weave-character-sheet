
import React from 'react';
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";

export interface StandardArrayPanelProps {
  stats: {[key: string]: number};
  getModifier: (score: number) => string;
}

const StandardArrayPanel: React.FC<StandardArrayPanelProps> = ({
  stats,
  getModifier
}) => {
  const { theme } = useTheme();
  // Добавляем защиту от undefined, используя 'default' как значение по умолчанию
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  return (
    <div>
      <p className="mb-4 text-muted-foreground">
        Стандартный набор значений: 15, 14, 13, 12, 10, 8. Эти значения уже распределены между характеристиками.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {Object.entries(stats).filter(([key]) => 
          key === 'strength' || key === 'dexterity' || key === 'constitution' ||
          key === 'intelligence' || key === 'wisdom' || key === 'charisma'
        ).map(([key, value]) => {
          const modifier = getModifier(value);
          
          return (
            <div key={key} className="p-4 border rounded text-center">
              <h3 className="font-bold text-lg mb-1 text-foreground">{getStatName(key)}</h3>
              <div className="text-3xl font-bold mb-1 text-foreground">{value}</div>
              <div className="text-xl mb-3" style={{ color: currentTheme.accent }}>{modifier}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Вспомогательные функции
function getStatName(stat: string): string {
  const names: {[key: string]: string} = {
    'strength': 'Сила',
    'dexterity': 'Ловкость',
    'constitution': 'Телосложение',
    'intelligence': 'Интеллект',
    'wisdom': 'Мудрость',
    'charisma': 'Харизма'
  };
  return names[stat] || stat;
}

export default StandardArrayPanel;
