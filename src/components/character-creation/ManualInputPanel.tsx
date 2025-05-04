import React from 'react';
import { ABILITY_SCORE_CAPS } from '@/types/character';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

// Update the getMaxAbilityScore function:
export const getMaxAbilityScore = (level?: number, maxAbilityScoreOverride?: number): number => {
  if (maxAbilityScoreOverride) return maxAbilityScoreOverride;
  
  if (level && level >= 16) return ABILITY_SCORE_CAPS.LEGENDARY_CAP;
  if (level && level >= 10) return ABILITY_SCORE_CAPS.EPIC_CAP; 
  return ABILITY_SCORE_CAPS.BASE_CAP;
};

interface ManualInputPanelProps {
  stats: { [key: string]: number };
  onAbilityChange: (ability: string, value: number) => void;
  maxAbilityScore?: number;
}

const ManualInputPanel: React.FC<ManualInputPanelProps> = ({
  stats,
  onAbilityChange,
  maxAbilityScore = ABILITY_SCORE_CAPS.BASE_CAP
}) => {
  // Функция для обработки изменения значения характеристики
  const handleChange = (ability: string, value: string) => {
    // Преобразуем строковое значение в число
    const numValue = parseInt(value, 10) || ABILITY_SCORE_CAPS.DEFAULT;
    
    // Ограничиваем значение в пределах допустимого диапазона
    const clampedValue = Math.min(Math.max(numValue, ABILITY_SCORE_CAPS.MIN), maxAbilityScore);
    
    // Обновляем значение характеристики
    onAbilityChange(ability, clampedValue);
  };
  
  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-4">
        Введите значения характеристик вручную. Минимальное значение: {ABILITY_SCORE_CAPS.MIN}, 
        максимальное значение: {maxAbilityScore}.
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(stats).filter(([key]) => 
          key === 'strength' || key === 'dexterity' || key === 'constitution' ||
          key === 'intelligence' || key === 'wisdom' || key === 'charisma'
        ).map(([ability, value]) => {
          return (
            <div key={ability} className="space-y-2">
              <label htmlFor={ability} className="block font-medium text-sm">
                {getAbilityDisplayName(ability)}
              </label>
              <input
                id={ability}
                type="number"
                min={ABILITY_SCORE_CAPS.MIN}
                max={maxAbilityScore}
                value={value as number}
                onChange={(e) => handleChange(ability, e.target.value)}
                className="w-full p-2 border rounded bg-background"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Вспомогательная функция для получения отображаемого имени характеристики
function getAbilityDisplayName(ability: string): string {
  const abilityNames: Record<string, string> = {
    'strength': 'Сила (STR)',
    'dexterity': 'Ловкость (DEX)',
    'constitution': 'Телосложение (CON)',
    'intelligence': 'Интеллект (INT)',
    'wisdom': 'Мудрость (WIS)',
    'charisma': 'Харизма (CHA)'
  };
  
  return abilityNames[ability] || ability;
}

export default ManualInputPanel;
