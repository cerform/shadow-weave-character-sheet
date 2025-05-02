
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
    <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
      <h3 className="text-lg font-semibold mb-4" style={{ color: currentTheme.textColor }}>
        Характеристики
      </h3>
      
      <div className="space-y-3">
        {abilities.map(({ key, name, rus }) => {
          const score = character?.abilities?.[key] || 10;
          const modifier = getModifier(score);
          const isPositiveModifier = !modifier.includes('-');
          
          return (
            <div key={key} className="grid grid-cols-6 gap-2 items-center">
              <div className="col-span-3 text-sm font-medium" style={{ color: currentTheme.textColor }}>
                {rus}
              </div>
              <div className="col-span-1 text-center bg-black/20 py-1 rounded" style={{ color: currentTheme.abilityScoreColor }}>
                {score}
              </div>
              <div className={`col-span-2 text-center py-1 rounded ${isPositiveModifier ? "bg-green-900/30" : "bg-red-900/30"}`}>
                <span className={isPositiveModifier ? "text-green-400" : "text-red-400"}>
                  {modifier}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      
      {character && (
        <div className="mt-6 space-y-3">
          <h4 className="font-medium text-sm mb-2" style={{ color: currentTheme.textColor }}>
            Спасброски
          </h4>
          {abilities.map(({ key, name, rus }) => {
            const proficient = character.savingThrowProficiencies?.[key] || false;
            const score = character?.abilities?.[key] || 10;
            const baseModifier = Math.floor((score - 10) / 2);
            const profBonus = character.level ? Math.ceil(1 + (character.level / 4)) : 2;
            const modifier = proficient ? baseModifier + profBonus : baseModifier;
            const modifierText = modifier >= 0 ? `+${modifier}` : `${modifier}`;
            const isPositive = modifier >= 0;
            
            return (
              <div key={`save-${key}`} className="grid grid-cols-6 items-center">
                <div className="col-span-3 text-sm" style={{ color: currentTheme.textColor }}>
                  {rus}
                </div>
                <div className="col-span-3">
                  <span className={`px-2 py-1 rounded ${isPositive ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"}`}>
                    {modifierText} {proficient && '⭐'}
                  </span>
                </div>
              </div>
            );
          })}
          
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-black/20 p-3 rounded text-center">
              <div className="text-xs mb-1" style={{ color: currentTheme.mutedTextColor }}>Класс брони</div>
              <div className="text-xl font-bold" style={{ color: currentTheme.textColor }}>
                {character.armorClass || 10}
              </div>
            </div>
            <div className="bg-black/20 p-3 rounded text-center">
              <div className="text-xs mb-1" style={{ color: currentTheme.mutedTextColor }}>Инициатива</div>
              <div className="text-xl font-bold" style={{ color: currentTheme.textColor }}>
                {getModifier(character?.abilities?.DEX || 10)}
              </div>
            </div>
          </div>
          
          <div className="mt-2">
            <div className="text-xs mb-1" style={{ color: currentTheme.mutedTextColor }}>Скорость</div>
            <div className="text-sm" style={{ color: currentTheme.textColor }}>
              {character.speed || 30} футов
            </div>
          </div>
          
          <div className="mt-2">
            <div className="text-xs mb-1" style={{ color: currentTheme.mutedTextColor }}>Грузоподъёмность</div>
            <div className="text-sm" style={{ color: currentTheme.textColor }}>
              {(character?.abilities?.STR || 10) * 15} фунтов
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
