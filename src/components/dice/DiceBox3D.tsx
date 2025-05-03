
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import GradientDice from "./GradientDice";
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";

interface DiceBox3DProps {
  diceType: 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';
  diceCount?: number;
  modifier?: number;
  onRollComplete?: (result: number) => void;
  hideControls?: boolean;
  themeColor?: string;
}

const DiceBox3D: React.FC<DiceBox3DProps> = ({
  diceType = 'd20',
  diceCount = 1,
  modifier = 0,
  onRollComplete,
  hideControls = false,
  themeColor
}) => {
  const [rolling, setRolling] = useState<boolean>(false);
  const [results, setResults] = useState<number[]>([]);
  const [totalResult, setTotalResult] = useState<number | null>(null);
  
  const { toast } = useToast();
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  
  // Преобразовать HEX цвет в градиентные цвета
  const getGradientColors = (baseColor: string) => {
    // Создаем два оттенка для градиента на основе базового цвета
    const color1 = baseColor;
    
    // Функция для осветления цвета (для второго цвета градиента)
    const lightenColor = (color: string, amount: number) => {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      
      const brightenR = Math.min(255, r + amount);
      const brightenG = Math.min(255, g + amount);
      const brightenB = Math.min(255, b + amount);
      
      return `#${brightenR.toString(16).padStart(2, '0')}${brightenG.toString(16).padStart(2, '0')}${brightenB.toString(16).padStart(2, '0')}`;
    };
    
    const color2 = lightenColor(baseColor, 40);
    
    return { color1, color2 };
  };
  
  const accentColor = themeColor || currentTheme.accent;
  const { color1, color2 } = getGradientColors(accentColor);
  
  const handleRollDice = () => {
    if (rolling) return;
    
    setRolling(true);
    setResults([]);
    setTotalResult(null);
    
    // Определяем максимальное значение для типа кубика
    const maxValue = parseInt(diceType.substring(1));
    
    setTimeout(() => {
      // Генерируем результаты для каждого кубика
      const newResults: number[] = [];
      let total = 0;
      
      for (let i = 0; i < diceCount; i++) {
        const roll = Math.floor(Math.random() * maxValue) + 1;
        newResults.push(roll);
        total += roll;
      }
      
      // Добавляем модификатор к общему результату
      const finalResult = total + modifier;
      
      setResults(newResults);
      setTotalResult(finalResult);
      setRolling(false);
      
      if (onRollComplete) {
        onRollComplete(finalResult);
      }
      
      // Показываем уведомление с результатом броска
      toast({
        title: `Результат броска ${diceCount}${diceType}${modifier >= 0 ? '+' + modifier : modifier}`,
        description: `${newResults.join(' + ')}${modifier !== 0 ? (modifier > 0 ? ' + ' + modifier : ' - ' + Math.abs(modifier)) : ''} = ${finalResult}`
      });
      
    }, 800); // Время анимации броска
  };
  
  return (
    <div className="dice-box-container relative w-full h-full min-h-[200px] flex items-center justify-center">
      {/* Показываем только один кубик для упрощения UI */}
      <div className="w-full h-full flex items-center justify-center">
        <GradientDice
          diceType={diceType}
          size={150}
          rolling={rolling}
          result={totalResult}
          showNumber={true}
          color1={color1}
          color2={color2}
        />
        
        {/* Отображение модификатора */}
        {modifier !== 0 && (
          <div className="absolute bottom-2 right-2 text-white bg-black/50 px-2 py-1 rounded text-sm">
            {modifier > 0 ? '+' : ''}{modifier}
          </div>
        )}
      </div>
      
      {/* Кнопка броска */}
      {!hideControls && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <Button
            onClick={handleRollDice}
            disabled={rolling}
            style={{ backgroundColor: accentColor }}
            className="px-6 text-white"
          >
            {rolling ? 'Бросаю...' : `Бросить ${diceCount}${diceType}`}
          </Button>
        </div>
      )}
    </div>
  );
};

export default DiceBox3D;
