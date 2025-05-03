
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ABILITY_SCORE_CAPS } from '@/types/character.d';
import { Card, CardContent } from "@/components/ui/card";

interface ManualInputPanelProps {
  stats: {[key: string]: number};
  updateStat: (stat: string, value: number) => void;
  getModifier: (score: number) => string;
  maxAbilityScore?: number;
  level?: number;
}

export const ManualInputPanel: React.FC<ManualInputPanelProps> = ({
  stats,
  updateStat,
  getModifier,
  maxAbilityScore = ABILITY_SCORE_CAPS.BASE_CAP,
  level = 1
}) => {
  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">
        Введите значения характеристик вручную. Значение от 1 до {maxAbilityScore} (максимум для вашего уровня).
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {Object.keys(stats).map((key) => {
          const stat = key as keyof typeof stats;
          const value = stats[stat];
          const modifier = getModifier(value);
          
          return (
            <Card key={key} className="border rounded">
              <CardContent className="p-4 text-center">
                <h3 className="font-bold text-lg mb-1 text-foreground">{getStatName(key)}</h3>
                <div className="text-3xl font-bold mb-1 text-foreground">{value}</div>
                <div className="text-xl mb-3 text-accent">{modifier}</div>
                
                <div>
                  <Label htmlFor={`${key}-input`} className="text-sm text-muted-foreground">
                    Значение (1-{maxAbilityScore})
                  </Label>
                  <Input
                    type="number"
                    id={`${key}-input`}
                    value={value.toString()} // Convert number to string to fix the type error
                    onChange={(e) => {
                      const newValue = parseInt(e.target.value, 10);
                      if (!isNaN(newValue) && newValue >= 1 && newValue <= maxAbilityScore) {
                        updateStat(stat, newValue);
                      }
                    }}
                    className="text-center"
                  />
                </div>
              </CardContent>
            </Card>
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
