
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dices } from "lucide-react";

interface HitPointsRollerProps {
  characterClass: string;
  level: number;
  constitutionModifier: number;
  onHitPointsRolled: (hp: number) => void;
  initialHp?: number;
}

const HitPointsRoller: React.FC<HitPointsRollerProps> = ({
  characterClass,
  level,
  constitutionModifier,
  onHitPointsRolled,
  initialHp
}) => {
  const { toast } = useToast();
  const [totalHp, setTotalHp] = useState<number>(initialHp || 0);
  const [rolledValues, setRolledValues] = useState<number[]>([]);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  
  // Определяем тип кубика для класса
  const getHitDieType = (): number => {
    const hitDice: Record<string, number> = {
      "Варвар": 12,
      "Воин": 10,
      "Паладин": 10,
      "Следопыт": 10,
      "Жрец": 8,
      "Друид": 8,
      "Монах": 8,
      "Плут": 8,
      "Бард": 8,
      "Колдун": 8,
      "Чернокнижник": 8,
      "Волшебник": 6,
      "Чародей": 6
    };
    
    return hitDice[characterClass] || 8;
  };
  
  const hitDieType = getHitDieType();
  
  // Рассчитываем HP для первого уровня (максимальное значение)
  const getFirstLevelHp = (): number => {
    return hitDieType + constitutionModifier;
  };
  
  // Бросаем кубик для уровня
  const rollForLevel = (level: number): number => {
    // На первом уровне максимальное значение
    if (level === 1) {
      return getFirstLevelHp();
    } 
    // Для остальных уровней бросаем кубик
    else {
      const roll = Math.floor(Math.random() * hitDieType) + 1;
      
      // Минимум 1 HP на уровень
      const levelHp = Math.max(1, roll + constitutionModifier);
      return levelHp;
    }
  };
  
  // Рассчитываем среднее значение для уровня
  const getAverageForLevel = (level: number): number => {
    // На первом уровне максимальное значение
    if (level === 1) {
      return getFirstLevelHp();
    } 
    // Для остальных уровней берем среднее значение кубика
    else {
      const averageRoll = Math.floor(hitDieType / 2) + 1;
      
      // Минимум 1 HP на уровень
      const levelHp = Math.max(1, averageRoll + constitutionModifier);
      return levelHp;
    }
  };
  
  // Бросаем кубики для всех уровней
  const rollAllLevels = () => {
    setIsRolling(true);
    
    // Анимация бросания кубиков
    let currentLevel = 1;
    const rolls: number[] = [];
    
    const rollInterval = setInterval(() => {
      if (currentLevel <= level) {
        const roll = rollForLevel(currentLevel);
        rolls.push(roll);
        setRolledValues([...rolls]);
        currentLevel++;
      } else {
        // Завершаем анимацию
        clearInterval(rollInterval);
        setIsRolling(false);
        
        // Суммируем результат
        const total = rolls.reduce((sum, val) => sum + val, 0);
        setTotalHp(total);
        onHitPointsRolled(total);
        
        toast({
          title: "Хиты рассчитаны",
          description: `Ваш персонаж имеет ${total} очков здоровья.`
        });
      }
    }, 300);
  };
  
  // Выбираем средние значения для всех уровней
  const useAverageValues = () => {
    const averages: number[] = [];
    
    // Рассчитываем среднее для каждого уровня
    for (let i = 1; i <= level; i++) {
      averages.push(getAverageForLevel(i));
    }
    
    // Устанавливаем результат
    setRolledValues(averages);
    const total = averages.reduce((sum, val) => sum + val, 0);
    setTotalHp(total);
    onHitPointsRolled(total);
    
    toast({
      title: "Хиты рассчитаны",
      description: `Ваш персонаж имеет ${total} очков здоровья (средние значения).`
    });
  };
  
  // При изменении уровня персонажа или модификатора телосложения
  // пересчитываем HP, если уже были рассчитаны
  useEffect(() => {
    if (rolledValues.length > 0) {
      // Если есть сохраненные броски, но уровень изменился
      if (rolledValues.length !== level) {
        // Сбрасываем броски
        setRolledValues([]);
        setTotalHp(0);
      }
    }
  }, [level, constitutionModifier, rolledValues.length]);
  
  // При первой загрузке, если есть initialHp, восстанавливаем средние значения
  useEffect(() => {
    if (initialHp && rolledValues.length === 0) {
      const averages: number[] = [];
      for (let i = 1; i <= level; i++) {
        averages.push(getAverageForLevel(i));
      }
      setRolledValues(averages);
    }
  }, [initialHp, level]);

  return (
    <Card className="border border-primary/20 bg-black/85">
      <CardHeader className="bg-primary/10 border-b border-primary/20">
        <CardTitle className="flex items-center gap-2">
          <Dices className="h-5 w-5" /> Очки здоровья
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm mb-1">Класс персонажа</p>
              <Badge variant="outline" className="bg-primary/20 border-primary/30">
                {characterClass} (d{hitDieType})
              </Badge>
            </div>
            <div>
              <p className="text-sm mb-1">Модификатор телосложения</p>
              <Badge variant="outline" className="bg-primary/20 border-primary/30">
                {constitutionModifier >= 0 ? `+${constitutionModifier}` : constitutionModifier}
              </Badge>
            </div>
          </div>
          
          <Alert className="bg-black/60 border-primary/20">
            <AlertDescription>
              На 1 уровне персонаж получает максимальное значение хитов для своего класса (d{hitDieType} = {hitDieType}). 
              На последующих уровнях вы можете бросать кубики или выбрать среднее значение.
            </AlertDescription>
          </Alert>
          
          <div className="flex justify-between gap-4">
            <Button 
              variant="outline" 
              className="flex-1 bg-black/60 hover:bg-primary/20 border-primary/30"
              onClick={rollAllLevels}
              disabled={isRolling}
            >
              Бросить кубики
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 bg-black/60 hover:bg-primary/20 border-primary/30"
              onClick={useAverageValues}
              disabled={isRolling}
            >
              Средние значения
            </Button>
          </div>
          
          {rolledValues.length > 0 && (
            <div className="mt-4">
              <div className="font-medium mb-2">Результаты по уровням:</div>
              <div className="grid grid-cols-5 gap-2">
                {rolledValues.map((roll, index) => (
                  <div 
                    key={index}
                    className="p-2 text-center border border-primary/20 rounded bg-black/60"
                  >
                    <div className="text-xs">Уровень {index + 1}</div>
                    <div className="font-bold">{roll}</div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-4 text-center bg-primary/10 border border-primary/30 rounded">
                <div className="text-sm">Всего хитов:</div>
                <div className="font-bold text-3xl">{totalHp}</div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default HitPointsRoller;
