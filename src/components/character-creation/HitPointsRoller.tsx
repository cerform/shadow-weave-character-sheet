
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import SimpleDiceRenderer from '../dice/SimpleDiceRenderer';
import DiceBox3D from '../dice/DiceBox3D';

interface HitPointsRollerProps {
  characterClass: string;
  level: number;
  constitutionModifier: number;
  onHitPointsRolled: (hp: number) => void;
  initialHp?: number;
}

// Карта соответствия классов и их кубиков здоровья
const CLASS_HIT_DICE: Record<string, number> = {
  'Варвар': 12,
  'Воин': 10,
  'Паладин': 10,
  'Следопыт': 10,
  'Монах': 8,
  'Плут': 8,
  'Друид': 8,
  'Бард': 8,
  'Жрец': 8,
  'Колдун': 8,
  'Волшебник': 6,
  'Чародей': 6,
};

const HitPointsRoller: React.FC<HitPointsRollerProps> = ({
  characterClass,
  level,
  constitutionModifier,
  onHitPointsRolled,
  initialHp
}) => {
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [rollState, setRollState] = useState<'waiting' | 'rolling' | 'rolled'>('waiting');
  const [finalHp, setFinalHp] = useState<number | null>(initialHp || null);
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;

  // Определяем тип кубика здоровья для класса
  const getHitDieType = (): number => {
    return CLASS_HIT_DICE[characterClass] || 8; // По умолчанию d8, если класс не найден
  };

  const hitDie = getHitDieType();

  // Получение строкового представления типа кубика для SimpleDiceRenderer
  const getDiceTypeForRenderer = (dieValue: number): "d4" | "d6" | "d8" | "d10" | "d12" | "d20" => {
    switch(dieValue) {
      case 4: return "d4";
      case 6: return "d6";
      case 8: return "d8";
      case 10: return "d10";
      case 12: return "d12";
      case 20: return "d20";
      default: return "d6"; // Fallback to d6
    }
  };

  // Для первого уровня максимальное значение кубика + модификатор Телосложения
  const getFirstLevelHp = (): number => {
    return hitDie + constitutionModifier;
  };

  // Рассчитываем общее количество HP на основе уровня и класса
  const calculateTotalHp = (diceRoll: number): number => {
    // HP первого уровня всегда максимальное значение кубика + модификатор Телосложения
    const firstLevelHp = hitDie + constitutionModifier;
    
    if (level === 1) {
      return firstLevelHp;
    } 
    
    // Для уровней 2+, добавляем результат броска + конституция для каждого уровня
    // Бросаем количество кубиков равное (уровень - 1)
    const additionalHp = diceRoll + (constitutionModifier * (level - 1));
    
    return firstLevelHp + additionalHp;
  };

  // Обработчик завершения броска кубика
  const handleDiceRollComplete = (result: number) => {
    setDiceValue(result);
    setRollState('rolled');
    
    const totalHp = calculateTotalHp(result);
    setFinalHp(totalHp);
    onHitPointsRolled(totalHp);
  };

  // Обработчик броска кубика
  const handleRoll = () => {
    setRollState('rolling');
    // Обработка результата броска выполнится в handleDiceRollComplete
  };

  // Для текстового представления типа кубика и количества
  const getDiceText = (dieType: number): string => {
    if (level === 1) {
      return `d${dieType} (максимум)`;
    }
    return `${level-1}d${dieType}`;
  };

  return (
    <Card className="border border-primary/20 shadow-lg">
      <CardHeader className="bg-primary/5 border-b border-primary/10">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Очки здоровья (HP)
          </div>
          <Badge className="bg-primary/20" variant="outline">
            Класс: {characterClass}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Кубик хитов:
              </h4>
              <div className="text-xl font-bold" style={{ color: currentTheme.accent }}>
                {getDiceText(hitDie)}
              </div>
            </div>
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Мод. телосложения:
              </h4>
              <div className="text-xl font-bold" style={{ color: currentTheme.accent }}>
                {constitutionModifier >= 0 ? `+${constitutionModifier}` : constitutionModifier}
              </div>
            </div>
          </div>

          {/* Контейнер для рендеринга кубика */}
          <div className="flex justify-center">
            <div className="dice-container relative mx-auto" style={{height: "150px", width: "100%", maxWidth: "300px", perspective: "400px"}}>
              {rollState !== 'waiting' && (
                <DiceBox3D 
                  diceType={getDiceTypeForRenderer(hitDie)}
                  onRollComplete={handleDiceRollComplete}
                  hideControls={true}
                  themeColor={currentTheme.accent}
                  diceCount={level > 1 ? level - 1 : 1}
                />
              )}
              {rollState === 'waiting' && (
                <SimpleDiceRenderer 
                  type={getDiceTypeForRenderer(hitDie)}
                  size={150}
                  themeColor={currentTheme.accent}
                />
              )}
            </div>
          </div>

          {/* Результат броска */}
          {rollState === 'rolled' && diceValue && (
            <div className="dice-result-container text-center p-4 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm text-muted-foreground">Результат броска:</p>
              <div className="text-2xl font-bold mt-1" style={{ color: currentTheme.accent }}>
                {diceValue}
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Итоговое HP:</p>
                <div className="text-3xl font-bold dice-value">
                  {finalHp}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {level === 1 
                    ? `${hitDie} (максимум) + ${constitutionModifier} (модификатор Телосложения)`
                    : `${hitDie} (1-й уровень) + ${diceValue} (${level-1}d${hitDie}) + ${constitutionModifier * level} (${constitutionModifier} × ${level} уровней)`
                  }
                </p>
              </div>
            </div>
          )}

          {/* Кнопка броска */}
          <Button 
            className="w-full" 
            onClick={handleRoll}
            disabled={rollState === 'rolling'}
            style={{
              backgroundColor: currentTheme.accent + "20",
              borderColor: currentTheme.accent,
              color: currentTheme.accent === '#8B5A2B' || currentTheme.accent === '#F59E0B' ? '#fff' : currentTheme.accent
            }}
          >
            {rollState === 'rolling' ? 'Бросаем кубик...' : 'Бросить кубик хитов'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HitPointsRoller;
