
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { useToast } from '@/hooks/use-toast';
import PlayerDicePanel from '@/components/character-sheet/PlayerDicePanel';

interface HitPointsRollerProps {
  characterClass: string;
  level: number;
  constitutionModifier: number;
  onHitPointsRolled: (hp: number) => void;
  initialHp?: number;
}

export const HitPointsRoller: React.FC<HitPointsRollerProps> = ({
  characterClass,
  level,
  constitutionModifier,
  onHitPointsRolled,
  initialHp
}) => {
  const [isRolling, setIsRolling] = useState(false);
  const [hitPoints, setHitPoints] = useState<number>(initialHp || 0);
  const [rolls, setRolls] = useState<number[]>([]);
  
  const { theme } = useTheme();
  const { toast } = useToast();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;

  // Определение типа кубика HP в зависимости от класса
  const getHitDice = (className: string): 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' => {
    switch (className) {
      case "Варвар": return "d12";
      case "Воин":
      case "Паладин":
      case "Следопыт":
        return "d10";
      case "Бард":
      case "Жрец":
      case "Друид":
      case "Монах":
      case "Плут":
      case "Колдун":
        return "d8";
      case "Волшебник":
      case "Чародей":
        return "d6";
      default:
        return "d8";
    }
  };

  // Максимум на первом уровне
  const getFirstLevelHp = (className: string): number => {
    switch (className) {
      case "Варвар": return 12;
      case "Воин":
      case "Паладин":
      case "Следопыт":
        return 10;
      case "Бард":
      case "Жрец":
      case "Друид":
      case "Монах":
      case "Плут":
      case "Колдун":
        return 8;
      case "Волшебник":
      case "Чародей":
        return 6;
      default:
        return 8;
    }
  };
  
  // Вычисляем итоговые HP
  const calculateFinalHp = (rollsArray: number[]) => {
    const firstLevelHp = getFirstLevelHp(characterClass) + constitutionModifier;
    const additionalHp = rollsArray.reduce((sum, roll) => sum + roll + constitutionModifier, 0);
    const total = firstLevelHp + additionalHp;
    
    setHitPoints(total);
    onHitPointsRolled(total);
    
    toast({
      title: "Очки здоровья вычислены!",
      description: `Итоговое HP: ${total}`,
    });
  };

  // Функция для броска кубиков и расчета HP
  const rollHitPoints = () => {
    setIsRolling(true);
    setRolls([]);
    
    // На 1 уровне HP = максимум кубика + модификатор Телосложения
    const firstLevelHp = getFirstLevelHp(characterClass) + constitutionModifier;
    
    // Если персонаж только 1 уровня, сразу устанавливаем HP
    if (level === 1) {
      setHitPoints(firstLevelHp);
      onHitPointsRolled(firstLevelHp);
      setIsRolling(false);
      
      toast({
        title: "Очки здоровья вычислены!",
        description: `На 1 уровне ваше HP: ${firstLevelHp}`,
      });
    } else {
      // На каждом уровне после первого кидаем кубик и добавляем модификатор Телосложения
      let newRolls = [];
      let totalAdditionalHp = 0;
      
      for (let i = 1; i < level; i++) {
        const hitDice = getHitDice(characterClass);
        const diceMax = parseInt(hitDice.substring(1));
        const roll = Math.floor(Math.random() * diceMax) + 1;
        newRolls.push(roll);
        totalAdditionalHp += roll + constitutionModifier;
      }
      
      const totalHp = firstLevelHp + totalAdditionalHp;
      
      setRolls(newRolls);
      setHitPoints(totalHp);
      onHitPointsRolled(totalHp);
      setIsRolling(false);
      
      toast({
        title: "Очки здоровья вычислены!",
        description: `Итоговое HP: ${totalHp}`,
      });
    }
  };

  // Функция для взятия среднего значения
  const takeAverageHp = () => {
    const hitDice = getHitDice(characterClass);
    const firstLevelHp = getFirstLevelHp(characterClass) + constitutionModifier;
    const diceMax = parseInt(hitDice.substring(1));
    
    // На 1 уровне HP = максимум кубика + модификатор Телосложения
    let totalHp = firstLevelHp;
    
    // Начиная со 2 уровня, берем среднее значение
    if (level > 1) {
      const averageRoll = Math.ceil(diceMax / 2); // Среднее значение кубика
      // Для каждого уровня после первого добавляем среднее + модификатор Телосложения
      totalHp += (level - 1) * (averageRoll + constitutionModifier);
    }
    
    setHitPoints(totalHp);
    setRolls([]);
    
    // Отправляем результат родительскому компоненту
    onHitPointsRolled(totalHp);
    
    toast({
      title: "Взято среднее значение",
      description: `Итоговое HP: ${totalHp}`,
    });
  };

  // Отображение результатов бросков
  const renderRollsHistory = () => {
    if (rolls.length === 0) return null;
    
    return (
      <div className="mt-4 space-y-2">
        <p className="text-sm font-medium text-white">История бросков:</p>
        <div className="flex flex-wrap gap-2">
          {rolls.map((roll, index) => (
            <Badge key={index} variant="outline">
              Кубик {index + 1}: {roll}
            </Badge>
          ))}
        </div>
      </div>
    );
  };

  // Вычисляем какой дайс использовать для класса персонажа
  const hitDice = getHitDice(characterClass);

  return (
    <>
      <Card className="shadow-lg border border-primary/20">
        <CardHeader className="bg-primary/10">
          <CardTitle className="text-xl">Очки здоровья (HP)</CardTitle>
        </CardHeader>
        
        <CardContent className="p-4 md:p-6">
          <div className="mb-6 space-y-4">
            <p className="text-sm text-white">
              На 1 уровне ваше HP равно максимуму кубика хит-поинтов вашего класса ({getFirstLevelHp(characterClass)}) + 
              модификатор Телосложения ({constitutionModifier >= 0 ? '+' : ''}{constitutionModifier}).
            </p>
            
            <p className="text-sm text-white">
              На каждом следующем уровне вы можете либо бросить кубик и добавить модификатор Телосложения,
              либо взять среднее значение + модификатор Телосложения.
            </p>
            
            <p className="text-sm font-medium text-white">
              Ваш уровень: {level}, необходимо бросить {level > 1 ? level - 1 : 0} кубиков.
            </p>
          </div>
          
          {/* Добавляем стандартный компонент для бросков кубиков */}
          {level > 1 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-2 text-white">Бросок кубиков для HP</h3>
              <p className="text-sm mb-4 text-white">
                Вы можете использовать кубик {hitDice} для бросков здоровья:
              </p>
              <PlayerDicePanel compactMode={true} fixedPosition={false} />
            </div>
          )}
          
          {hitPoints > 0 && (
            <div className="mt-6 text-center">
              <h3 className="text-2xl font-bold text-white">Итоговое HP: {hitPoints}</h3>
            </div>
          )}
          
          {renderRollsHistory()}
        </CardContent>
        
        <CardFooter className="bg-primary/5 flex flex-col sm:flex-row justify-between gap-3 p-4">
          <Button 
            onClick={rollHitPoints}
            disabled={isRolling}
            className="w-full sm:w-auto"
            variant="default"
          >
            Бросить автоматически
          </Button>
          
          <Button 
            onClick={takeAverageHp}
            disabled={isRolling}
            className="w-full sm:w-auto"
            variant="outline"
          >
            Взять среднее значение
          </Button>
        </CardFooter>
      </Card>
    </>
  );
};

export default HitPointsRoller;
