import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CharacterSheet } from '@/types/character';

interface CharacterLevelSelectionProps {
  character: CharacterSheet;
  updateCharacter: (updates: Partial<CharacterSheet>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const CharacterLevelSelection: React.FC<CharacterLevelSelectionProps> = ({
  character,
  updateCharacter,
  nextStep,
  prevStep
}) => {
  const [level, setLevel] = useState(character.level || 1);

  useEffect(() => {
    setLevel(character.level || 1);
  }, [character.level]);

  const handleLevelChange = (newLevel: number) => {
    setLevel(newLevel);
  };

  const handleSaveLevel = () => {
    updateCharacter({ level: level });
    nextStep();
  };

  return (
    <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
      <CardHeader>
        <CardTitle>Выбор уровня персонажа</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <label className="block text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Уровень:
          </label>
          <input
            type="number"
            value={level}
            onChange={(e) => handleLevelChange(parseInt(e.target.value))}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <div className="flex justify-between">
          <Button variant="secondary" onClick={prevStep}>
            Назад
          </Button>
          <Button onClick={handleSaveLevel}>Сохранить и продолжить</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CharacterLevelSelection;
