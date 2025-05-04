
import React, { useState } from 'react';
import { CharacterSheet } from '@/types/character';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface CharacterLevelSelectionProps {
  character: CharacterSheet;
  updateCharacter: (updates: Partial<CharacterSheet>) => void;
  nextStep: () => void;
  prevStep: () => void;
  onLevelChange: (level: number) => void;
}

const CharacterLevelSelection: React.FC<CharacterLevelSelectionProps> = ({ 
  character, 
  updateCharacter, 
  nextStep, 
  prevStep,
  onLevelChange
}) => {
  const [level, setLevel] = useState(character.level || 1);
  const [experiencePoints, setExperiencePoints] = useState(character.experiencePoints || 0);

  // Таблица опыта для уровней
  const experienceTable = [
    0,         // 1 уровень
    300,       // 2 уровень
    900,       // 3 уровень
    2_700,     // 4 уровень
    6_500,     // 5 уровень
    14_000,    // 6 уровень
    23_000,    // 7 уровень
    34_000,    // 8 уровень
    48_000,    // 9 уровень
    64_000,    // 10 уровень
    85_000,    // 11 уровень
    100_000,   // 12 уровень
    120_000,   // 13 уровень
    140_000,   // 14 уровень
    165_000,   // 15 уровень
    195_000,   // 16 уровень
    225_000,   // 17 уровень
    265_000,   // 18 уровень
    305_000,   // 19 уровень
    355_000    // 20 уровень
  ];

  // Обработчик изменения уровня
  const handleLevelChange = (newLevel: number) => {
    setLevel(newLevel);
    setExperiencePoints(experienceTable[newLevel - 1]);
    onLevelChange(newLevel);
  };

  // Обработчик сохранения уровня и перехода к следующему шагу
  const handleNextStep = () => {
    updateCharacter({
      level,
      experiencePoints
    });
    nextStep();
  };

  return (
    <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
      <CardHeader>
        <CardTitle>Уровень персонажа</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Выберите уровень:</h3>
            <div className="py-4">
              <div className="flex justify-between mb-2">
                <span>1</span>
                <span>{level}</span>
                <span>20</span>
              </div>
              <Slider
                value={[level]}
                min={1}
                max={20}
                step={1}
                onValueChange={(values) => handleLevelChange(values[0])}
              />
            </div>
          </div>

          <div>
            <p className="mb-2">
              <span className="font-medium">Опыт:</span> {experiencePoints.toLocaleString()}
            </p>
            <p className="mb-2">
              <span className="font-medium">Бонус мастерства:</span> +{Math.floor(2 + (level - 1) / 4)}
            </p>

            <div className="bg-muted/20 p-3 rounded-md mt-4">
              <h4 className="text-sm font-semibold mb-2">Что дает этот уровень:</h4>
              <ul className="list-disc pl-5 text-sm">
                <li>Бонус мастерства: +{Math.floor(2 + (level - 1) / 4)}</li>
                {level >= 4 && <li>Улучшение характеристик на 4 уровне</li>}
                {level >= 8 && <li>Улучшение характеристик на 8 уровне</li>}
                {level >= 12 && <li>Улучшение характеристик на 12 уровне</li>}
                {level >= 16 && <li>Улучшение характеристик на 16 уровне</li>}
                {level >= 19 && <li>Улучшение характеристик на 19 уровне</li>}
              </ul>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="secondary" onClick={prevStep}>
              Назад
            </Button>
            <Button onClick={handleNextStep}>
              Сохранить и продолжить
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CharacterLevelSelection;
