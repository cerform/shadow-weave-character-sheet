
import React, { useState } from "react";
import NavigationButtons from "@/components/character-creation/NavigationButtons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CharacterLevelSelectionProps {
  character: any;
  updateCharacter: (updates: any) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const CharacterLevelSelection: React.FC<CharacterLevelSelectionProps> = ({
  character,
  updateCharacter,
  nextStep,
  prevStep,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<number>(character.level || 1);
  
  const handleLevelChange = (level: number) => {
    if (level >= 1 && level <= 20) {
      setSelectedLevel(level);
    }
  };

  const handleNext = () => {
    updateCharacter({ level: selectedLevel });
    nextStep();
  };

  const levelPresets = [1, 3, 5, 10, 15, 20];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Выберите уровень персонажа</h2>
      <p className="text-muted-foreground mb-6">
        Уровень определяет силу и способности вашего персонажа. Новички обычно начинают с 1-3 уровня.
      </p>
      
      <div className="mb-6">
        <div className="flex gap-2 justify-center mb-4">
          {levelPresets.map((level) => (
            <Button
              key={level}
              onClick={() => handleLevelChange(level)}
              variant={selectedLevel === level ? "default" : "outline"}
              size="sm"
              className="w-12 h-12"
            >
              {level}
            </Button>
          ))}
        </div>
        
        <div className="flex items-center justify-center gap-4 mt-4">
          <span className="text-sm font-medium">Выбран уровень:</span>
          <div className="flex items-center">
            <Button
              size="icon"
              variant="outline"
              onClick={() => handleLevelChange(selectedLevel - 1)}
              disabled={selectedLevel <= 1}
            >
              -
            </Button>
            <Input
              type="number"
              value={selectedLevel}
              onChange={(e) => handleLevelChange(parseInt(e.target.value))}
              className="w-16 text-center mx-2"
              min={1}
              max={20}
            />
            <Button
              size="icon"
              variant="outline"
              onClick={() => handleLevelChange(selectedLevel + 1)}
              disabled={selectedLevel >= 20}
            >
              +
            </Button>
          </div>
        </div>
      </div>
      
      <div className="bg-primary/10 p-4 rounded-md mb-6">
        <h3 className="font-semibold mb-2">Информация о {selectedLevel} уровне:</h3>
        <ul className="list-disc pl-5 space-y-1">
          {selectedLevel === 1 && (
            <>
              <li>Начальный уровень персонажа</li>
              <li>Доступ к основным способностям класса</li>
            </>
          )}
          {selectedLevel >= 3 && <li>Доступ к подклассу (архетип)</li>}
          {selectedLevel >= 4 && <li>Увеличение характеристик</li>}
          {selectedLevel >= 5 && <li>Дополнительная атака или заклинания 3 уровня</li>}
          {selectedLevel >= 11 && <li>Мощные способности среднего уровня</li>}
          {selectedLevel >= 17 && <li>Высокоуровневые способности и заклинания</li>}
        </ul>
      </div>
      
      <NavigationButtons
        allowNext={true}
        nextStep={handleNext}
        prevStep={prevStep}
        isFirstStep={false}
      />
    </div>
  );
};

export default CharacterLevelSelection;
