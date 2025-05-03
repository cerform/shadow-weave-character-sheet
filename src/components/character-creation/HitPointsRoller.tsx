
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { useToast } from '@/hooks/use-toast';
import SimpleDiceRenderer from '@/components/dice/SimpleDiceRenderer';

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
  const [currentDiceResult, setCurrentDiceResult] = useState<number | null>(null);
  
  const { theme } = useTheme();
  const { toast } = useToast();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;

  // Определение типа кубика HP в зависимости от класса
  const getHitDice = (className: string): 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' => {
    // Приведем имя класса к нижнему регистру для более надежного сравнения
    const normalizedClassName = className.toLowerCase().trim();
    
    if (normalizedClassName.includes('варвар')) return "d12";
    
    if (
      normalizedClassName.includes('воин') || 
      normalizedClassName.includes('паладин') || 
      normalizedClassName.includes('следопыт')
    ) return "d10";
    
    if (
      normalizedClassName.includes('бард') || 
      normalizedClassName.includes('жрец') || 
      normalizedClassName.includes('друид') || 
      normalizedClassName.includes('монах') || 
      normalizedClassName.includes('плут') || 
      normalizedClassName.includes('колдун')
    ) return "d8";
    
    if (
      normalizedClassName.includes('волшебник') || 
      normalizedClassName.includes('чародей')
    ) return "d6";
    
    // Если класс не распознан, возвращаем d8 как базовое значение
    console.warn(`Неизвестный класс для определения кубика хитов: ${className}, используем d8`);
    return "d8";
  };

  // Максимум на первом уровне
  const getFirstLevelHp = (className: string): number => {
    const normalizedClassName = className.toLowerCase().trim();
    
    if (normalizedClassName.includes('варвар')) return 12;
    
    if (
      normalizedClassName.includes('воин') || 
      normalizedClassName.includes('паладин') || 
      normalizedClassName.includes('следопыт')
    ) return 10;
    
    if (
      normalizedClassName.includes('бард') || 
      normalizedClassName.includes('жрец') || 
      normalizedClassName.includes('друид') || 
      normalizedClassName.includes('монах') || 
      normalizedClassName.includes('плут') || 
      normalizedClassName.includes('колдун')
    ) return 8;
    
    if (
      normalizedClassName.includes('волшебник') || 
      normalizedClassName.includes('чародей')
    ) return 6;
    
    // Если класс не распознан, возвращаем 8 как базовое значение
    console.warn(`Неизвестный класс для определения первого уровня HP: ${className}, используем 8`);
    return 8;
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
    setCurrentDiceResult(null);
    
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
        
        // Устанавливаем последний бросок для отображения в визуализации
        if (i === level - 1) {
          setCurrentDiceResult(roll);
        }
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
    setCurrentDiceResult(null);
    
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
      <div className="mt-4 space-y-2 bg-black/20 p-3 rounded-lg">
        <p className="text-sm font-medium">История бросков:</p>
        <div className="flex flex-wrap gap-2">
          {rolls.map((roll, index) => (
            <Badge key={index} variant="outline" className="bg-black/30 text-white">
              Уровень {index + 2}: {roll} {constitutionModifier >= 0 ? '+' : ''}{constitutionModifier} = {roll + constitutionModifier}
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
        <CardHeader className="bg-primary/10 border-b border-primary/20">
          <CardTitle className="text-xl flex justify-between items-center">
            <span>Очки здоровья (HP)</span>
            <Badge variant="outline" className="ml-2 text-sm">
              Класс: {characterClass}
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-4 md:p-6 space-y-6">
          <div className="space-y-4 border-b border-primary/10 pb-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">Кубик хитов:</h3>
                <p className="text-sm opacity-80">
                  {hitDice} ({characterClass})
                </p>
              </div>
              <div className="text-right">
                <h3 className="text-lg font-bold">Мод. телосложения:</h3>
                <p className="text-sm opacity-80">
                  {constitutionModifier >= 0 ? '+' : ''}{constitutionModifier}
                </p>
              </div>
            </div>
            
            <div className="bg-black/20 p-3 rounded-lg text-sm space-y-2">
              <p>
                На <strong>1 уровне</strong> ваше HP равно максимуму кубика хит-поинтов вашего класса 
                (<strong>{getFirstLevelHp(characterClass)}</strong>) + модификатор Телосложения
                (<strong>{constitutionModifier >= 0 ? '+' : ''}{constitutionModifier}</strong>).
              </p>
              
              <p>
                На каждом следующем уровне вы можете либо бросить кубик и добавить модификатор Телосложения,
                либо взять среднее значение + модификатор Телосложения.
              </p>
              
              <p className="font-medium">
                Ваш уровень: <strong>{level}</strong>, необходимо бросить <strong>{level > 1 ? level - 1 : 0}</strong> кубиков.
              </p>
            </div>
          </div>
          
          {/* Добавляем визуализацию кубика */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center border-b border-primary/10 pb-4">
            <div className="w-32 h-32">
              <SimpleDiceRenderer 
                type={hitDice} 
                size={128}
                themeColor={currentTheme.accent}
                result={currentDiceResult || undefined}
              />
            </div>
            
            <div className="text-center md:text-left">
              <div className="mb-2 font-medium opacity-80">
                Ваш кубик хитов:
              </div>
              <div className="text-3xl font-bold" style={{ color: currentTheme.accent }}>
                {hitDice}
              </div>
              <div className="text-sm opacity-70 mt-1">
                ({getFirstLevelHp(characterClass)} на первом уровне)
              </div>
            </div>
          </div>
          
          {hitPoints > 0 && (
            <div className="text-center bg-primary/10 p-4 rounded-lg">
              <h3 className="text-sm font-medium opacity-80">Итоговое HP:</h3>
              <div className="text-3xl font-bold mt-1" style={{ color: currentTheme.accent, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                {hitPoints}
              </div>
            </div>
          )}
          
          {renderRollsHistory()}
        </CardContent>
        
        <CardFooter className="bg-primary/5 border-t border-primary/20 flex flex-col sm:flex-row justify-between gap-3 p-4">
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
