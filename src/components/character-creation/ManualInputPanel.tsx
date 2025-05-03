
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CharacterSheet } from '@/types/character.d';

interface ManualInputPanelProps {
  abilityScores: CharacterSheet['abilities'];
  setAbilityScores: (scores: CharacterSheet['abilities']) => void;
  maxAbilityScore: number;
  level?: number;
  stats?: CharacterSheet['abilities']; // Добавляем опциональное свойство stats
  updateStat?: (stat: keyof CharacterSheet['abilities'], value: number) => void;
  getModifier?: (score: number) => string;
}

const ManualInputPanel: React.FC<ManualInputPanelProps> = ({
  abilityScores,
  setAbilityScores,
  maxAbilityScore,
  stats, 
  updateStat,
  getModifier,
  level
}) => {
  // Используем stats или abilityScores в зависимости от того, что передано
  const scores = stats || abilityScores;
  
  const handleAbilityChange = (ability: keyof CharacterSheet['abilities'], value: string) => {
    const numValue = parseInt(value) || 0;
    if (numValue > maxAbilityScore) {
      return;
    }
    
    // Используем updateStat если он предоставлен, иначе используем setAbilityScores
    if (updateStat) {
      updateStat(ability, numValue);
    } else {
      setAbilityScores({
        ...scores,
        [ability]: numValue
      });
    }
  };

  const resetScores = () => {
    setAbilityScores({
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(scores).map(([ability, value]) => (
          <div key={ability} className="space-y-1">
            <Label htmlFor={ability} className="capitalize text-white">
              {ability}
            </Label>
            <Input
              id={ability}
              type="number"
              value={value.toString()}
              min="3"
              max={maxAbilityScore}
              onChange={(e) => handleAbilityChange(ability as keyof CharacterSheet['abilities'], e.target.value)}
              className="text-white bg-black/50 border-white/30"
            />
          </div>
        ))}
      </div>
      
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={resetScores}
          className="text-white bg-black/50 hover:bg-white/20"
        >
          Сбросить
        </Button>
      </div>
    </div>
  );
};

export default ManualInputPanel;
