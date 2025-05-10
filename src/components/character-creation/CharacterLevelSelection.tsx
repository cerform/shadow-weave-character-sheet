import React, { useState } from 'react';
import { Character } from '@/types/character';
import { ABILITY_SCORE_CAPS } from '@/types/constants';
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Update interface to match usage in CharacterCreationContent
export interface CharacterLevelSelectionProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void; // Changed from updateCharacter to onUpdate
  nextStep: () => void;
  prevStep: () => void;
  onLevelChange: (level: number) => void;
}

// Component implementation
const CharacterLevelSelection: React.FC<CharacterLevelSelectionProps> = ({
  character,
  onUpdate,
  nextStep,
  prevStep,
  onLevelChange
}) => {
  const [level, setLevel] = useState(character.level || 1);
  
  // Update this to use onUpdate instead of updateCharacter
  const handleLevelChange = (newLevel: number) => {
    onUpdate({ level: newLevel });
    onLevelChange(newLevel);
  };
  
  const handleNext = () => {
    handleLevelChange(level);
    nextStep();
  };
  
  const handlePrev = () => {
    handleLevelChange(level);
    prevStep();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Выберите уровень персонажа</CardTitle>
        <CardDescription>Укажите уровень вашего персонажа.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center space-x-2">
          <Label htmlFor="level">Уровень:</Label>
          <span className="text-lg font-semibold">{level}</span>
        </div>
        <Slider
          id="level"
          defaultValue={[character.level || 1]}
          max={20}
          min={1}
          step={1}
          onValueChange={(value) => setLevel(value[0])}
        />
        <div className="flex justify-between">
          <Button variant="secondary" onClick={handlePrev}>
            Назад
          </Button>
          <Button onClick={handleNext}>Далее</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CharacterLevelSelection;
