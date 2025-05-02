
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Dices } from "lucide-react";
import GradientDice from "./GradientDice";

interface DiceRoller3DFixedProps {
  initialDice?: "d4" | "d6" | "d8" | "d10" | "d12" | "d20";
  hideControls?: boolean;
  showModifier?: boolean;
  modifier?: number;
  onRollComplete?: (result: number) => void;
  fixedPosition?: boolean;
  themeColor?: string;
  playerName?: string; // Added playerName prop
  diceCount?: number;
}

const DiceRoller3DFixed: React.FC<DiceRoller3DFixedProps> = ({
  initialDice = "d20",
  hideControls = false,
  showModifier = true,
  modifier = 0,
  onRollComplete,
  fixedPosition = false,
  themeColor = "30, 144, 255", // RGB значение для голубого цвета по умолчанию
  playerName,
  diceCount = 1
}) => {
  const [selectedDice, setSelectedDice] = useState<"d4" | "d6" | "d8" | "d10" | "d12" | "d20">(initialDice);
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedDice(initialDice);
  }, [initialDice]);

  const getRandomRotation = () => {
    return {
      x: Math.random() * 360,
      y: Math.random() * 360,
      z: Math.random() * 360
    };
  };

  const rollDice = () => {
    if (isRolling) return;
    
    setIsRolling(true);
    setResult(null);

    let rolls: number[] = [];
    let totalResult = 0;
    
    // Симулируем броски для каждого кубика
    for (let i = 0; i < diceCount; i++) {
      const roll = Math.floor(Math.random() * Number(selectedDice.slice(1))) + 1;
      rolls.push(roll);
      totalResult += roll;
    }
    
    // Добавляем модификатор к общему результату
    totalResult += modifier;

    // Анимация броска - быстрое вращение
    const rollInterval = setInterval(() => {
      setRotation(getRandomRotation());
    }, 50);

    // Останавливаем вращение и показываем результат
    setTimeout(() => {
      clearInterval(rollInterval);
      setIsRolling(false);
      setResult(totalResult);
      
      if (onRollComplete) {
        onRollComplete(totalResult);
      }
      
      // Показываем уведомление с результатом броска
      toast({
        title: `Результат броска ${diceCount}${selectedDice}${modifier >= 0 ? '+' + modifier : modifier}`,
        description: `${playerName ? playerName + ' выбросил ' : ''}${rolls.join(' + ')}${modifier !== 0 ? (modifier > 0 ? ' + ' + modifier : ' - ' + Math.abs(modifier)) : ''} = ${totalResult}`,
      });
      
    }, 800); // Время броска в миллисекундах
  };

  // Обработчик изменения типа кубика
  const handleDiceChange = (dice: "d4" | "d6" | "d8" | "d10" | "d12" | "d20") => {
    setSelectedDice(dice);
    setResult(null);
  };

  return (
    <div className="dice-roller-3d relative" ref={containerRef}>
      {!hideControls && (
        <div className="dice-controls absolute top-2 left-2 z-10 flex space-x-1">
          {["d4", "d6", "d8", "d10", "d12", "d20"].map((dice) => (
            <Button
              key={dice}
              size="sm"
              variant={selectedDice === dice ? "default" : "outline"}
              onClick={() => handleDiceChange(dice as any)}
              className={`p-1 h-6 min-w-[30px] text-xs ${selectedDice === dice ? "bg-primary" : ""}`}
            >
              {dice}
            </Button>
          ))}
        </div>
      )}

      <div 
        className="dice-container flex items-center justify-center"
        style={{ 
          height: "100%",
          width: "100%",
          perspective: "1000px"
        }}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          <GradientDice 
            diceType={selectedDice}
            size={140}
            rolling={isRolling}
            result={result}
            showNumber={true}
          />
          
          {showModifier && modifier !== 0 && (
            <div className="absolute bottom-2 right-2 text-white font-bold px-2 py-0.5 rounded bg-black/40 text-sm">
              {modifier > 0 ? "+" : ""}{modifier}
            </div>
          )}
        </div>
      </div>

      {!hideControls && (
        <div className="dice-actions absolute bottom-2 left-1/2 transform -translate-x-1/2">
          <Button onClick={rollDice} disabled={isRolling} size="sm">
            <Dices className="mr-1 size-4" /> Бросить
          </Button>
        </div>
      )}
    </div>
  );
};

export default DiceRoller3DFixed;
