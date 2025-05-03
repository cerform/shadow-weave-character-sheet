
import React, { useState, useEffect } from 'react';
import { CharacterSheet, ABILITY_SCORE_CAPS } from '@/types/character.d';
import NavigationButtons from './NavigationButtons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import HitPointsRoller from './HitPointsRoller';
import LevelBasedFeatures from './LevelBasedFeatures';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import SectionHeader from "@/components/ui/section-header";
import { useLevelFeatures } from '@/hooks/useLevelFeatures';
import { Shield, TrendingUp, Skull } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Badge } from '@/components/ui/badge';

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
  const { availableFeatures } = useLevelFeatures(character);
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;

  // Проверка, выбран ли подкласс (если требуется)
  const needsSubclass = availableFeatures.some(f => f.type === 'subclass');
  const subclassSelected = character.subclass !== undefined && character.subclass !== '';

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

  // Проверка всех обязательных выборов
  const requiredSelectionsMade = !needsSubclass || subclassSelected;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Выберите уровень персонажа"
        description="Уровень определяет силу и способности вашего персонажа. Начинающие игроки обычно начинают с 1 уровня."
      />
      
      <Card className="border border-primary/20 shadow-lg bg-black/85">
        <CardHeader className="bg-primary/10 border-b border-primary/20">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" /> 
            Уровень персонажа
          </CardTitle>
        </CardHeader>
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
                <div className="flex justify-between text-xs">
                  <span>Новичок</span>
                  <span>Опытный</span>
                  <span>Герой</span>
                  <span>Легенда</span>
                </div>
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
                  value={level.toString()}
                  onChange={handleInputChange}
                  className="text-center font-bold text-lg bg-black/60"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-center py-4 border-y border-primary/20 my-4">
              <div className="text-center px-8 py-4 bg-black/60 rounded-lg shadow-lg" style={{ boxShadow: `0 0 20px ${currentTheme.accent}40` }}>
                <span className="text-sm">Текущий уровень</span>
                <div className="font-bold text-5xl" style={{ color: currentTheme.accent, textShadow: "0px 2px 4px rgba(0, 0, 0, 0.8)" }}>
                  {level}
                </div>
                {level <= 5 && <span className="text-xs">Начальный уровень</span>}
                {level > 5 && level <= 10 && <span className="text-xs">Опытный искатель приключений</span>}
                {level > 10 && level <= 15 && <span className="text-xs">Герой государства</span>}
                {level > 15 && <span className="text-xs">Герой континента</span>}
              </div>
            </div>
            
            {statCapAlert && (
              <Alert variant="default" className="bg-black/70 border border-primary/30">
                <Shield className="h-4 w-4" />
                <AlertTitle>Влияние на характеристики</AlertTitle>
                <AlertDescription>{statCapAlert}</AlertDescription>
              </Alert>
            )}
            
            {level >= 5 && (
              <Alert variant="default" className="bg-black/70 border-primary/30">
                <TrendingUp className="h-4 w-4" />
                <AlertTitle>Дополнительные очки характеристик</AlertTitle>
                <AlertDescription>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span>5 уровень:</span> 
                      <Badge className="bg-primary/20 border border-primary/50" variant="outline">+3 очка</Badge>
                    </div>
                    {level >= 10 && (
                      <div className="flex justify-between items-center">
                        <span>10 уровень:</span> 
                        <Badge className="bg-primary/20 border border-primary/50" variant="outline">+5 очков</Badge>
                      </div>
                    )}
                    {level >= 15 && (
                      <div className="flex justify-between items-center">
                        <span>15 уровень:</span> 
                        <Badge className="bg-primary/20 border border-primary/50" variant="outline">+7 очков</Badge>
                      </div>
                    )}
                  </div>
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
      
      {/* Предупреждение если не выбраны обязательные опции */}
      {needsSubclass && !subclassSelected && (
        <Alert variant="destructive" className="mt-4 bg-red-900/80 border-red-500">
          <Skull className="h-4 w-4" />
          <AlertTitle>Не выбран архетип</AlertTitle>
          <AlertDescription>
            Для вашего класса на текущем уровне необходимо выбрать архетип. Нажмите на кнопку "Детали" в разделе Архетип.
          </AlertDescription>
        </Alert>
      )}
      
      <NavigationButtons
        nextStep={nextStep}
        prevStep={prevStep}
        allowNext={requiredSelectionsMade} // Переход дальше только если выбраны все обязательные опции
      />
    </div>
  );
};

export default CharacterLevelSelection;
