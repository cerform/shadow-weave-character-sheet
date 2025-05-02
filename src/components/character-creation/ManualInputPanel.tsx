
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";

interface ManualInputPanelProps {
  stats: {[key: string]: number};
  updateStat: (stat: string, value: number) => void;
  getModifier: (score: number) => string;
}

export const ManualInputPanel: React.FC<ManualInputPanelProps> = ({
  stats,
  updateStat,
  getModifier
}) => {
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes];
  
  const handleInputChange = (stat: string, value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 30) {
      updateStat(stat, numValue);
    }
  };
  
  const adjustStat = (stat: string, amount: number) => {
    const currentValue = stats[stat as keyof typeof stats];
    const newValue = currentValue + amount;
    if (newValue >= 1 && newValue <= 30) {
      updateStat(stat, newValue);
    }
  };
  
  return (
    <div>
      <p className="mb-4 text-muted-foreground">
        Введите значения характеристик вручную (от 1 до 30).
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {Object.keys(stats).map((key) => {
          const stat = key as keyof typeof stats;
          const value = stats[stat];
          const modifier = getModifier(value);
          
          return (
            <div key={key} className="p-4 border rounded text-center">
              <h3 className="font-bold text-lg mb-1 text-foreground">{getStatName(key)}</h3>
              
              <div className="flex items-center justify-center gap-2 mb-2">
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={() => adjustStat(key, -1)}
                  disabled={stats[stat] <= 1}
                >
                  -
                </Button>
                
                <Input
                  type="number"
                  value={value}
                  onChange={(e) => handleInputChange(key, e.target.value)}
                  min={1}
                  max={30}
                  className="w-16 text-center"
                />
                
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={() => adjustStat(key, 1)}
                  disabled={stats[stat] >= 30}
                >
                  +
                </Button>
              </div>
              
              <div className="text-xl" style={{ color: currentTheme.accent }}>{modifier}</div>
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

export default ManualInputPanel;
