
import React, { useState, useEffect } from 'react';
import { Dices, Heart } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { 
  Progress, 
  Card, 
  CardContent,
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui";
import { calculateMaxHitPoints } from '@/utils/characterUtils';

interface CharacterHitPointsCalculatorProps {
  level: number;
  characterClass: string;
  constitutionModifier: number;
  onHitPointsCalculated: (hitPoints: number) => void;
}

export const CharacterHitPointsCalculator: React.FC<CharacterHitPointsCalculatorProps> = ({
  level,
  characterClass,
  constitutionModifier,
  onHitPointsCalculated
}) => {
  const [calculatedHP, setCalculatedHP] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  // Рассчитываем хит-поинты при изменении класса, уровня или модификатора телосложения
  useEffect(() => {
    // Преобразуем строковый уровень в число для расчётов
    const numericLevel = Number(level);
    
    const maxHP = calculateMaxHitPoints(
      numericLevel, 
      characterClass, 
      constitutionModifier
    );
    
    setCalculatedHP(maxHP);
    onHitPointsCalculated(maxHP);
  }, [level, characterClass, constitutionModifier, onHitPointsCalculated]);

  // Запуск анимации расчета хит-поинтов
  const animateHitPointsCalculation = () => {
    if (isCalculating) return;
    
    setIsCalculating(true);
    
    // Сбрасываем значение для анимации
    setCalculatedHP(0);
    
    // Постепенно увеличиваем значение
    const finalHP = calculateMaxHitPoints(
      Number(level), 
      characterClass, 
      constitutionModifier
    );
    
    const increment = Math.max(1, Math.ceil(finalHP / 20));
    let current = 0;
    
    const interval = setInterval(() => {
      current += increment;
      if (current >= finalHP) {
        setCalculatedHP(finalHP);
        clearInterval(interval);
        setIsCalculating(false);
        onHitPointsCalculated(finalHP);
      } else {
        setCalculatedHP(current);
      }
    }, 100);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Heart className="mr-2 h-5 w-5 text-red-500" />
          Расчет хит-поинтов
        </CardTitle>
        <CardDescription>
          Расчет максимального количества хит-поинтов персонажа на основе класса, уровня и телосложения
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <div>Класс: <span className="font-semibold">{characterClass}</span></div>
            <div>Уровень: <span className="font-semibold">{level}</span></div>
            <div>Модификатор телосложения: <span className="font-semibold">{constitutionModifier >= 0 ? `+${constitutionModifier}` : constitutionModifier}</span></div>
          </div>
          <Button 
            onClick={animateHitPointsCalculation}
            disabled={isCalculating}
            variant="outline"
            className="flex items-center"
          >
            <Dices className="mr-2 h-4 w-4" />
            {isCalculating ? 'Расчет...' : 'Пересчитать'}
          </Button>
        </div>
        
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Прогресс расчета</span>
            <span className="text-sm font-medium">{calculatedHP} HP</span>
          </div>
          <Progress 
            value={isCalculating ? undefined : 100} 
            className="h-2.5"
          />
        </div>
        
        <div className="p-4 bg-muted rounded-md">
          <div className="text-center text-2xl font-bold text-primary">
            {calculatedHP} HP
          </div>
          <div className="text-center text-xs text-muted-foreground mt-1">
            Максимальное количество хит-поинтов
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
