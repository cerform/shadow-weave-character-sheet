
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { FloatingDiceButton } from '@/components/dice/FloatingDiceButton';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { DiceRoller3DFixed } from '@/components/character-sheet/DiceRoller3DFixed';

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
  const [showDiceRoller, setShowDiceRoller] = useState(false);
  const [currentRollIndex, setCurrentRollIndex] = useState(0);
  
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

  // Обработчик результата броска кубика
  const handleDiceRollComplete = (result: number) => {
    if (currentRollIndex < level - 1) {
      // Добавляем результат броска в массив
      const newRolls = [...rolls];
      newRolls[currentRollIndex] = result;
      setRolls(newRolls);
      
      // Переходим к следующему броску или заканчиваем
      if (currentRollIndex < level - 2) {
        setCurrentRollIndex(currentRollIndex + 1);
      } else {
        // Вычисляем итоговые HP после всех бросков
        calculateFinalHp(newRolls);
        setShowDiceRoller(false);
        setCurrentRollIndex(0);
      }
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
    setCurrentRollIndex(0);
    
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
      // Если уровень > 1, открываем всплывающее окно для бросков
      setShowDiceRoller(true);
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
        <p className="text-sm font-medium">История бросков:</p>
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

  return (
    <>
      <Card className="shadow-lg border border-primary/20">
        <CardHeader className="bg-primary/10">
          <CardTitle className="text-xl">Очки здоровья (HP)</CardTitle>
        </CardHeader>
        
        <CardContent className="p-4 md:p-6">
          <div className="mb-6 space-y-4">
            <p className="text-sm">
              На 1 уровне ваше HP равно максимуму кубика хит-поинтов вашего класса ({getFirstLevelHp(characterClass)}) + 
              модификатор Телосложения ({constitutionModifier >= 0 ? '+' : ''}{constitutionModifier}).
            </p>
            
            <p className="text-sm">
              На каждом следующем уровне вы можете либо бросить кубик и добавить модификатор Телосложения,
              либо взять среднее значение + модификатор Телосложения.
            </p>
            
            <p className="text-sm font-medium">
              Ваш уровень: {level}, необходимо бросить {level > 1 ? level - 1 : 0} кубиков.
            </p>
          </div>
          
          <div className="bg-black/40 rounded-lg overflow-hidden p-4 h-[200px] flex items-center justify-center">
            {showDiceRoller ? (
              <DiceRoller3DFixed
                initialDice={getHitDice(characterClass)}
                hideControls={true}
                modifier={constitutionModifier}
                onRollComplete={handleDiceRollComplete}
                themeColor={currentTheme.accent}
              />
            ) : (
              <div className="text-center">
                <p className="text-lg mb-4 text-white">
                  {hitPoints > 0 
                    ? `Итоговое HP: ${hitPoints}` 
                    : "Бросьте кубики для определения HP"}
                </p>
                
                <Sheet open={showDiceRoller} onOpenChange={setShowDiceRoller}>
                  <SheetTrigger asChild>
                    <Button 
                      onClick={() => level > 1 && rollHitPoints()}
                      disabled={isRolling}
                      variant="default"
                    >
                      Бросить {level > 1 ? level - 1 : 0} кубиков {getHitDice(characterClass)}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[90%] sm:max-w-md p-0">
                    <SheetHeader className="p-4">
                      <SheetTitle>Бросок для HP</SheetTitle>
                      <SheetDescription>
                        Бросок {currentRollIndex + 1} из {level - 1}
                      </SheetDescription>
                    </SheetHeader>
                    <div className="h-[80vh]">
                      <DiceRoller3DFixed
                        initialDice={getHitDice(characterClass)}
                        hideControls={false}
                        modifier={constitutionModifier}
                        onRollComplete={handleDiceRollComplete}
                        themeColor={currentTheme.accent}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            )}
          </div>
          
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
            Бросить {level > 1 ? level - 1 : 0} кубиков {getHitDice(characterClass)}
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
