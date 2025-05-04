import React, { useState, useEffect } from 'react';
import { CharacterSheet, ABILITY_SCORE_CAPS } from '@/types/character.d';
import NavigationButtons from './NavigationButtons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import SectionHeader from "@/components/ui/section-header";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Badge } from '@/components/ui/badge';
import { useDeviceType } from '@/hooks/use-mobile';

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
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';

  // Обновляем уведомление о влиянии уровня на характеристики
  useEffect(() => {
    if (level >= 16) {
      setStatCapAlert(`На ${level} уровне максимальное значение характеристики составляет ${ABILITY_SCORE_CAPS.ABSOLUTE_MAX}.`);
    } else if (level >= 10) {
      setStatCapAlert(`На ${level} уровне максимальное значение характеристики составляет ${22}.`);
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

  // Следующая вкладка - переход к мультиклассированию
  const handleNext = () => {
    // Сохраняем текущий уровень персонажа
    updateCharacter({ level });
    nextStep();
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Уровень персонажа"
        description="Уровень определяет силу и способности вашего персонажа. Начинающие игроки обычно начинают с 1 уровня."
      />
      
      <Card className="border border-primary/20 shadow-lg bg-black/85">
        <CardHeader className="bg-primary/10 border-b border-primary/20">
          <CardTitle className="flex items-center gap-2">
            {!isMobile ? "Уровень персонажа" : "Уровень"}
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
                style={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.7)', 
                  borderColor: currentTheme.accent 
                }}
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
                <div className="flex justify-between text-xs" style={{ color: '#fff' }}>
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
                style={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.7)', 
                  borderColor: currentTheme.accent 
                }}
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
                  className="text-center font-bold text-lg bg-black/60 text-white"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-center py-4 border-y border-primary/20 my-4">
              <div className="text-center px-8 py-4 bg-black/60 rounded-lg shadow-lg" style={{ boxShadow: `0 0 20px ${currentTheme.accent}40` }}>
                <span className="text-sm text-white">Текущий уровень</span>
                <div className="font-bold text-5xl" style={{ color: currentTheme.accent, textShadow: "0px 2px 4px rgba(0, 0, 0, 0.8)" }}>
                  {level}
                </div>
                {level <= 5 && <span className="text-xs text-white">Начальный уровень</span>}
                {level > 5 && level <= 10 && <span className="text-xs text-white">Опытный искатель приключений</span>}
                {level > 10 && level <= 15 && <span className="text-xs text-white">Герой государства</span>}
                {level > 15 && <span className="text-xs text-white">Герой континента</span>}
              </div>
            </div>
            
            {statCapAlert && (
              <Alert variant="default" className="bg-black/70 border border-primary/30">
                <AlertTitle className="text-white">Влияние на характеристики</AlertTitle>
                <AlertDescription className="text-white">{statCapAlert}</AlertDescription>
              </Alert>
            )}
            
            {level >= 5 && (
              <Alert variant="default" className="bg-black/70 border-primary/30">
                <AlertTitle className="text-white">Дополнительные очки характеристик</AlertTitle>
                <AlertDescription>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-white">5 уровень:</span> 
                      <Badge className="bg-primary/20 border border-primary/50" variant="outline">+3 очка</Badge>
                    </div>
                    {level >= 10 && (
                      <div className="flex justify-between items-center">
                        <span className="text-white">10 уровень:</span> 
                        <Badge className="bg-primary/20 border border-primary/50" variant="outline">+5 очков</Badge>
                      </div>
                    )}
                    {level >= 15 && (
                      <div className="flex justify-between items-center">
                        <span className="text-white">15 уровень:</span> 
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

      {/* Кнопка перехода к мультиклассированию */}
      <div className="mt-6">
        <Alert variant="default" className="bg-black/70 border border-primary/30">
          <AlertTitle className="text-white">Мультиклассирование</AlertTitle>
          <AlertDescription className="text-white">
            Хотите добавить уровни в другие классы? Вы сможете сделать это на следующем шаге после выбора основного уровня.
          </AlertDescription>
        </Alert>
      </div>
      
      <NavigationButtons
        nextStep={handleNext}
        prevStep={prevStep}
        allowNext={true}
        isFirstStep={false}
      />
    </div>
  );
};

export default CharacterLevelSelection;
