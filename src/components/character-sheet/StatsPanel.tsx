
import React from 'react';
import { Card } from "@/components/ui/card";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface StatsPanelProps {
  character: any;
}

export const StatsPanel = ({ character }: StatsPanelProps) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  // Calculate modifier from ability score
  const getModifier = (score: number) => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  // Abilities order and translations
  const abilities = [
    { key: 'STR', name: 'Сила', rus: 'Сила' },
    { key: 'DEX', name: 'Ловкость', rus: 'Ловкость' },
    { key: 'CON', name: 'Телосложение', rus: 'Телосложение' },
    { key: 'INT', name: 'Интеллект', rus: 'Интеллект' },
    { key: 'WIS', name: 'Мудрость', rus: 'Мудрость' },
    { key: 'CHA', name: 'Харизма', rus: 'Харизма' }
  ] as const;

  return (
    <Card 
      className="p-4 bg-card/30 backdrop-blur-sm border-primary/20"
      style={{ 
        backgroundColor: `${currentTheme.cardBackground || 'rgba(20, 20, 30, 0.7)'}`,
        boxShadow: `0 0 10px ${currentTheme.accent}40`,
        borderColor: `${currentTheme.accent}30`
      }}
    >
      <h3 
        className="text-lg font-semibold mb-4" 
        style={{ 
          color: currentTheme.textColor,
          textShadow: `0 0 5px ${currentTheme.accent}40`
        }}
      >
        Характеристики
      </h3>
      
      <div className="space-y-3">
        {abilities.map(({ key, name, rus }) => {
          const score = character?.abilities?.[key] || 10;
          const modifier = getModifier(score);
          const isPositiveModifier = !modifier.includes('-');
          
          return (
            <div key={key} className="grid grid-cols-6 gap-2 items-center">
              <div 
                className="col-span-3 text-sm font-medium" 
                style={{ 
                  color: currentTheme.textColor,
                  textShadow: `0 0 2px ${currentTheme.accent}40` 
                }}
              >
                {rus}
              </div>
              <div 
                className="col-span-1 text-center py-1 rounded font-semibold" 
                style={{ 
                  backgroundColor: `${currentTheme.accent}20`,
                  color: currentTheme.textColor || 'white',
                  boxShadow: `inset 0 0 5px ${currentTheme.accent}30`
                }}
              >
                {score}
              </div>
              <div 
                className={`col-span-2 text-center py-1 rounded font-bold`}
                style={{ 
                  backgroundColor: isPositiveModifier ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)",
                  boxShadow: `inset 0 0 5px ${isPositiveModifier ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)"}`
                }}
              >
                <span 
                  style={{ 
                    color: isPositiveModifier ? "#4ade80" : "#f87171",
                    textShadow: `0 0 5px ${isPositiveModifier ? "rgba(74, 222, 128, 0.5)" : "rgba(248, 113, 113, 0.5)"}`
                  }}
                >
                  {modifier}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      
      {character && (
        <div className="mt-8 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div 
              className="p-3 rounded text-center"
              style={{ 
                backgroundColor: `${currentTheme.accent}15`,
                boxShadow: `inset 0 0 8px ${currentTheme.accent}30` 
              }}
            >
              <div 
                className="text-xs mb-1" 
                style={{ color: currentTheme.textColor || 'rgba(255, 255, 255, 0.9)' }}
              >
                Класс брони
              </div>
              <div 
                className="text-xl font-bold" 
                style={{ 
                  color: currentTheme.textColor || 'white',
                  textShadow: `0 0 5px ${currentTheme.accent}50`
                }}
              >
                {character.armorClass || 10}
              </div>
            </div>
            <div 
              className="p-3 rounded text-center"
              style={{ 
                backgroundColor: `${currentTheme.accent}15`,
                boxShadow: `inset 0 0 8px ${currentTheme.accent}30` 
              }}
            >
              <div 
                className="text-xs mb-1" 
                style={{ color: currentTheme.textColor || 'rgba(255, 255, 255, 0.9)' }}
              >
                Инициатива
              </div>
              <div 
                className="text-xl font-bold" 
                style={{ 
                  color: currentTheme.textColor || 'white',
                  textShadow: `0 0 5px ${currentTheme.accent}50`
                }}
              >
                {getModifier(character?.abilities?.DEX || 10)}
              </div>
            </div>
          </div>
          
          <div 
            className="mt-2 p-3 rounded"
            style={{ 
              backgroundColor: `${currentTheme.accent}10`,
              boxShadow: `inset 0 0 5px ${currentTheme.accent}20` 
            }}
          >
            <div 
              className="text-xs mb-1" 
              style={{ color: currentTheme.textColor || 'rgba(255, 255, 255, 0.9)' }}
            >
              Скорость
            </div>
            <div 
              className="text-sm font-medium" 
              style={{ 
                color: currentTheme.textColor || 'white',
                textShadow: `0 0 3px ${currentTheme.accent}40`
              }}
            >
              {character.speed || 30} футов
            </div>
          </div>
          
          <div 
            className="mt-2 p-3 rounded"
            style={{ 
              backgroundColor: `${currentTheme.accent}10`,
              boxShadow: `inset 0 0 5px ${currentTheme.accent}20` 
            }}
          >
            <div 
              className="text-xs mb-1" 
              style={{ color: currentTheme.textColor || 'rgba(255, 255, 255, 0.9)' }}
            >
              Грузоподъёмность
            </div>
            <div 
              className="text-sm font-medium" 
              style={{ 
                color: currentTheme.textColor || 'white',
                textShadow: `0 0 3px ${currentTheme.accent}40`
              }}
            >
              {(character?.abilities?.STR || 10) * 15} фунтов
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
