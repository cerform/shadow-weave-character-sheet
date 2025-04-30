
import React from 'react';
import { Card } from "@/components/ui/card";

interface StatsPanelProps {
  character: any;
}

export const StatsPanel = ({ character }: StatsPanelProps) => {
  // Calculate modifier from ability score
  const getModifier = (score: number) => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  // Abilities order and translations
  const abilities = [
    { key: 'STR', name: 'Сила' },
    { key: 'DEX', name: 'Ловкость' },
    { key: 'CON', name: 'Телосложение' },
    { key: 'INT', name: 'Интеллект' },
    { key: 'WIS', name: 'Мудрость' },
    { key: 'CHA', name: 'Харизма' }
  ] as const;

  return (
    <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
      <h3 className="text-lg font-semibold mb-4">Характеристики</h3>
      
      <div className="space-y-3">
        {abilities.map(({ key, name }) => {
          const score = character?.abilities?.[key] || 10;
          const modifier = getModifier(score);
          const isPositiveModifier = !modifier.includes('-');
          
          return (
            <div key={key} className="grid grid-cols-2 gap-2">
              <div className="text-sm font-medium">{name} ({key})</div>
              <div className="text-sm text-right">
                {score} <span className={isPositiveModifier ? "text-green-500" : "text-red-500"}>
                  {modifier}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
