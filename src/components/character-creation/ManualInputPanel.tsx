import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ABILITY_SCORE_CAPS } from '@/types/character.d';

interface ManualInputPanelProps {
  abilityScores: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  setAbilityScores: (scores: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  }) => void;
  maxAbilityScore: number;
  level: number;
}

const ManualInputPanel: React.FC<ManualInputPanelProps> = ({
  abilityScores,
  setAbilityScores,
  maxAbilityScore,
  level
}) => {
  const handleChange = (stat: string, value: number) => {
    if (value >= 1 && value <= maxAbilityScore) {
      setAbilityScores({
        ...abilityScores,
        [stat]: value,
      });
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {Object.entries(abilityScores).map(([stat, value]) => (
        <div key={stat} className="space-y-2">
          <Label htmlFor={stat} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {stat.charAt(0).toUpperCase() + stat.slice(1)}
          </Label>
          <Input
            type="number"
            id={stat}
            value={value}
            onChange={(e) => handleChange(stat, parseInt(e.target.value))}
            className="bg-background text-foreground"
            min="1"
            max={maxAbilityScore}
          />
        </div>
      ))}
    </div>
  );
};

export default ManualInputPanel;
