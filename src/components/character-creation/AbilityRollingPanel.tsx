
import React from 'react';
import { Button } from "@/components/ui/button";
import { Dices } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";

interface AbilityRollingPanelProps {
  diceResults: number[][];
  assignedDice: {[key: string]: number | null};
  onRollAllAbilities: () => void;
  onAssignDiceToStat: (stat: string, diceIndex: number) => void;
  onRollSingleAbility?: (stat: string) => void;
  stats: {[key: string]: number};
  getModifier: (score: number) => string;
}

export const AbilityRollingPanel: React.FC<AbilityRollingPanelProps> = ({
  diceResults,
  assignedDice,
  onRollAllAbilities,
  onAssignDiceToStat,
  onRollSingleAbility,
  stats,
  getModifier
}) => {
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes];
  
  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
        {diceResults.map((roll, index) => {
          const sortedRolls = [...roll].sort((a, b) => b - a);
          const total = sortedRolls.slice(0, 3).reduce((a, b) => a + b, 0);
          const isAssigned = Object.values(assignedDice).includes(index);
          
          return (
            <div 
              key={index}
              className={`p-2 border rounded text-center ${isAssigned ? 'bg-gray-200 opacity-50' : 'bg-card'}`}
            >
              <div className="text-sm text-foreground">Бросок {index + 1}</div>
              <div className="font-bold text-lg text-foreground">{total}</div>
              <div className="text-xs" style={{ color: currentTheme.accent }}>
                {sortedRolls.slice(0, 3).join(' + ')} {roll.length > 3 && <span className="line-through">+ {sortedRolls[3]}</span>}
              </div>
            </div>
          );
        })}
      </div>
      
      <Button 
        onClick={onRollAllAbilities}
        className="w-full mb-4"
        variant="outline"
      >
        <Dices className="mr-2 h-4 w-4" />
        Перебросить все кубики
      </Button>
      
      <p className="text-sm text-muted-foreground mb-4">
        Выберите результат броска для каждой характеристики, кликнув по характеристике, а затем по значению броска.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {Object.keys(stats).map((key) => {
          const stat = key as keyof typeof stats;
          const value = stats[stat];
          const modifier = getModifier(value);
          
          return (
            <div key={key} className="p-4 border rounded text-center">
              <h3 className="font-bold text-lg mb-1 text-foreground">{getStatName(key)}</h3>
              <div className="text-3xl font-bold mb-1 text-foreground">{value}</div>
              <div className="text-xl mb-3" style={{ color: currentTheme.accent }}>{modifier}</div>
              
              <div className="grid grid-cols-2 gap-2">
                {diceResults.map((roll, index) => {
                  const sortedRolls = [...roll].sort((a, b) => b - a);
                  const total = sortedRolls.slice(0, 3).reduce((a, b) => a + b, 0);
                  const isAssigned = Object.values(assignedDice).includes(index);
                  const isAssignedToThisStat = assignedDice[stat] === index;
                  
                  return (
                    <Button
                      key={index}
                      size="sm"
                      variant={isAssignedToThisStat ? "default" : "outline"}
                      disabled={isAssigned && !isAssignedToThisStat}
                      onClick={() => onAssignDiceToStat(key, index)}
                    >
                      {total}
                    </Button>
                  );
                })}
              </div>
              
              {onRollSingleAbility && (
                <Button
                  onClick={() => onRollSingleAbility(key)}
                  size="sm"
                  className="mt-2 w-full"
                >
                  <Dices className="mr-1 h-4 w-4" />
                  Отдельный бросок
                </Button>
              )}
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

export default AbilityRollingPanel;
