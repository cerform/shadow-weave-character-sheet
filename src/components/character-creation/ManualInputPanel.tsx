
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CharacterSheet } from '@/types/character.d';

interface ManualInputPanelProps {
  abilityScores: CharacterSheet['abilities'];
  setAbilityScores: (scores: CharacterSheet['abilities']) => void;
  maxAbilityScore: number;
  getModifier?: (score: number) => string;
  level?: number;
}

const ManualInputPanel: React.FC<ManualInputPanelProps> = ({
  abilityScores,
  setAbilityScores,
  maxAbilityScore,
  getModifier
}) => {
  const handleAbilityChange = (ability: keyof CharacterSheet['abilities'], value: string) => {
    const numValue = parseInt(value) || 0;
    if (numValue > maxAbilityScore) {
      return;
    }
    
    setAbilityScores({
      ...abilityScores,
      [ability]: numValue
    });
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
        {Object.entries(abilityScores).map(([ability, value]) => (
          <div key={ability} className="space-y-1">
            <Label htmlFor={ability} className="capitalize text-white">
              {ability}
              {getModifier && (
                <span className="ml-2 text-white">
                  {getModifier(value)}
                </span>
              )}
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
