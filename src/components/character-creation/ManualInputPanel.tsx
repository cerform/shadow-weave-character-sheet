
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ABILITY_SCORE_CAPS } from '@/types/character.d';

interface ManualInputPanelProps {
  abilityScores: { [key: string]: number };
  setAbilityScores: (abilityScores: { [key: string]: number }) => void;
  maxAbilityScore?: number;
  level?: number;
}

const abilityNames: { [key: string]: string } = {
  strength: 'Сила',
  dexterity: 'Ловкость',
  constitution: 'Телосложение',
  intelligence: 'Интеллект',
  wisdom: 'Мудрость',
  charisma: 'Харизма'
};

const ManualInputPanel: React.FC<ManualInputPanelProps> = ({
  abilityScores,
  setAbilityScores,
  maxAbilityScore,
  level = 1
}) => {
  // Определяем максимальное значение на основе уровня или переданного параметра
  const getMaxAbilityScore = (): number => {
    if (maxAbilityScore) return maxAbilityScore;
    
    if (level >= 16) return ABILITY_SCORE_CAPS.LEGENDARY_CAP;
    if (level >= 10) return ABILITY_SCORE_CAPS.EPIC_CAP;
    return ABILITY_SCORE_CAPS.BASE_CAP;
  };
  
  const maxScore = getMaxAbilityScore();
  
  const handleInputChange = (ability: string, value: string) => {
    const numValue = parseInt(value);
    
    if (!isNaN(numValue) && numValue >= 1 && numValue <= maxScore) {
      setAbilityScores({ ...abilityScores, [ability]: numValue });
    }
  };
  
  // Вычисление модификатора характеристики
  const getModifier = (score: number): string => {
    const modifier = Math.floor((score - 10) / 2);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-black/60 border-primary/20">
        <AlertDescription>
          Введите значения характеристик в диапазоне от 1 до {maxScore}.
          {level >= 10 && ' На вашем уровне максимальное значение повышено.'}
        </AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(abilityScores).map(([ability, score]) => (
          <div key={ability} className="space-y-2">
            <Label htmlFor={ability} className="flex justify-between">
              <span>{abilityNames[ability] || ability}</span>
              <span className="text-sm text-muted-foreground">
                Модификатор: {getModifier(score)}
              </span>
            </Label>
            <div className="relative">
              <Input
                id={ability}
                type="number"
                min="1"
                max={maxScore.toString()}
                value={score}
                onChange={(e) => handleInputChange(ability, e.target.value)}
                className="bg-black/60 text-white text-center text-lg font-bold"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-sm text-gray-400">/ {maxScore}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManualInputPanel;
