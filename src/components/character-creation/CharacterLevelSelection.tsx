
import React, { useState, useEffect } from 'react';
import { CharacterSheet, ABILITY_SCORE_CAPS } from '@/types/character';
import NavigationButtons from './NavigationButtons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import HitPointsRoller from './HitPointsRoller';
import LevelBasedFeatures from './LevelBasedFeatures';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

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
  const [statCapAlert, setStatCapAlert] = useState<string | null>(null);

  // Рассчитываем модификатор Телосложения
  const getConModifier = (): number => {
    if (!character.abilities) return 0;
    return Math.floor((character.abilities.constitution - 10) / 2);
  };

  // Обновляем уведомление о влиянии уровня на характеристики
  useEffect(() => {
    if (level >= 16) {
      setStatCapAlert(`На ${level} уровне максимальное значение характеристики составляет ${ABILITY_SCORE_CAPS.LEGENDARY_CAP}.`);
    } else if (level >= 10) {
      setStatCapAlert(`На ${level} уровне максимальное значение характеристики составляет ${ABILITY_SCORE_CAPS.EPIC_CAP}.`);
    } else {
      setStatCapAlert(null);
    }
  }, [level]);

  // Обработчик изменения уровня через слайдер
  const handleLevelChange = (newValue: number[]) => {
    const newLevel = newValue[0];
    setLevel(newLevel);
    onLevelChange(newLevel);
  };

  // Обработчик изменения уровня через кнопки
  const handleLevelAdjustment = (adjustment: number) => {
    const newLevel = Math.max(1, Math.min(20, level + adjustment));
    setLevel(newLevel);
    onLevelChange(newLevel);
  };

  // Обработчик изменения уровня через ввод
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= 20) {
      setLevel(value);
      onLevelChange(value);
    }
  };

  // Обработчик завершения броска HP
  const handleHitPointsRolled = (hp: number) => {
    updateCharacter({ maxHp: hp, currentHp: hp });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Выберите уровень персонажа</h2>
        <p className="text-muted-foreground">
          Уровень определяет силу и способности вашего персонажа. Начинающие игроки обычно начинают с 1 уровня.
        </p>
      </div>
      
      <Card className="border border-primary/20">
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <Button
                variant="outline"
                onClick={() => handleLevelAdjustment(-1)}
                disabled={level <= 1}
                className="w-12 h-12 rounded-full p-0 flex items-center justify-center"
              >
                -
              </Button>
              
              <div className="flex-grow">
                <Slider
                  value={[level]}
                  min={1}
                  max={20}
                  step={1}
                  onValueChange={handleLevelChange}
                  className="my-4"
                />
              </div>
              
              <Button
                variant="outline"
                onClick={() => handleLevelAdjustment(1)}
                disabled={level >= 20}
                className="w-12 h-12 rounded-full p-0 flex items-center justify-center"
              >
                +
              </Button>
              
              <div className="w-20">
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={level}
                  onChange={handleInputChange}
                  className="text-center font-bold text-lg"
                />
              </div>
            </div>
            
            <div className="text-center">
              <span className="font-bold text-3xl">{level}</span>
              <span className="text-xl"> уровень</span>
            </div>
            
            {statCapAlert && (
              <Alert>
                <AlertTitle>Влияние на характеристики</AlertTitle>
                <AlertDescription>{statCapAlert}</AlertDescription>
              </Alert>
            )}
            
            {level >= 5 && (
              <Alert variant="default" className="bg-primary/10 border-primary/30">
                <AlertTitle>Дополнительные очки характеристик</AlertTitle>
                <AlertDescription>
                  При использовании метода Point Buy вам доступны дополнительные очки:
                  {level >= 15 && ' +15 очков (5 уровень: +3, 10 уровень: +5, 15 уровень: +7)'}
                  {level >= 10 && level < 15 && ' +8 очков (5 уровень: +3, 10 уровень: +5)'}
                  {level >= 5 && level < 10 && ' +3 очка (5 уровень)'}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Информация о том, что доступно на выбранном уровне */}
      {character.class && (
        <div className="mt-8">
          <LevelBasedFeatures 
            character={character} 
            updateCharacter={updateCharacter} 
          />
        </div>
      )}
      
      {/* Компонент для броска кубика HP */}
      {character.class && (
        <div className="mt-6">
          <HitPointsRoller
            characterClass={character.class}
            level={level}
            constitutionModifier={getConModifier()}
            onHitPointsRolled={handleHitPointsRolled}
            initialHp={character.maxHp}
          />
        </div>
      )}
      
      <NavigationButtons
        nextStep={nextStep}
        prevStep={prevStep}
        allowNext={true} // Всегда можно продолжить, так как по умолчанию уровень = 1
      />
    </div>
  );
};

export default CharacterLevelSelection;
