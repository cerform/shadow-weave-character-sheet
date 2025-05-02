
import React from 'react';
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";

interface PointBuyPanelProps {
  stats: {[key: string]: number};
  pointsLeft: number;
  incrementStat: (stat: string) => void;
  decrementStat: (stat: string) => void;
  getModifier: (score: number) => string;
  getPointCost?: (value: number) => number;
  abilityScorePoints: number;
}

export const PointBuyPanel: React.FC<PointBuyPanelProps> = ({
  stats,
  pointsLeft,
  incrementStat,
  decrementStat,
  getModifier,
  getPointCost = () => 1,
  abilityScorePoints
}) => {
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes];
  
  return (
    <div>
      <div className="mb-4">
        <p className="mb-2 text-foreground">
          Осталось очков: <span className="font-bold">{pointsLeft}</span>
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          Распределите {abilityScorePoints} очков между характеристиками. Значение от 8 до 15.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {Object.keys(stats).map((key) => {
          const stat = key as keyof typeof stats;
          const value = stats[stat];
          const modifier = getModifier(value);
          
          return (
            <div key={key} className="p-4 border rounded text-center">
              <h3 className="font-bold text-lg mb-1 text-foreground">{getStatName(stat)}</h3>
              <div className="text-3xl font-bold mb-1 text-foreground">{value}</div>
              <div className="text-xl mb-3" style={{ color: currentTheme.accent }}>{modifier}</div>
              
              <div className="flex justify-center gap-2">
                <Button
                  onClick={() => decrementStat(stat)}
                  disabled={value <= 8}
                  size="sm"
                >
                  -
                </Button>
                <Button
                  onClick={() => incrementStat(stat)}
                  disabled={value >= 15 || pointsLeft < getPointCost(value + 1)}
                  size="sm"
                >
                  +
                </Button>
              </div>
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

export default PointBuyPanel;
