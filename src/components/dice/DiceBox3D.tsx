
import React, { useEffect, useRef, useState } from 'react';
import { DiceBox } from "@3d-dice/dice-box";
import { Button } from '@/components/ui/button';
import { Dices } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

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
  themeColor,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const diceBoxRef = useRef<any>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  const actualThemeColor = themeColor || currentTheme.accent;
  
  // Инициализация DiceBox
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Создаем экземпляр DiceBox
    const diceBox = new DiceBox(canvasRef.current, {
      assetPath: "/assets/dice-models/", // Путь к ассетам
      scale: 6,                         // Масштаб кубиков
      theme: "default",                 // Тема по умолчанию
      themeColor: actualThemeColor,     // Цвет темы
      gravity: { x: 0, y: 0, z: -9.8 }, // Гравитация
      mass: 1,                          // Масса кубиков
      friction: 0.8,                    // Трение
      shadows: true,                    // Тени
      origin: { x: 0, y: 10, z: 0 },    // Начальная позиция
      lightIntensity: 1.0,              // Интенсивность света
      delay: 10                         // Задержка между бросками
    });
    
    // Инициализация
    const initDiceBox = async () => {
      try {
        await diceBox.initialize();
        diceBoxRef.current = diceBox;
        console.log("DiceBox инициализирован успешно");
      } catch (error) {
        console.error("Ошибка при инициализации DiceBox:", error);
        // Если не удалось инициализировать, можно создать фолбэк здесь
      }
    };
    
    initDiceBox();
    
    // Очистка при размонтировании
    return () => {
      if (diceBoxRef.current) {
        diceBoxRef.current.clear();
      }
    };
  }, [actualThemeColor]);
  
  // Обработчик для броска кубиков
  const handleRoll = async () => {
    if (!diceBoxRef.current || isRolling) return;
    
    setIsRolling(true);
    setResult(null);
    
    try {
      // Формируем строку для броска (например, "3d6+2")
      const rollString = `${diceCount}${diceType}${modifier > 0 ? '+' + modifier : modifier < 0 ? modifier : ''}`;
      
      // Выполняем бросок
      const results = await diceBoxRef.current.roll(rollString);
      
      // Получаем результат
      const total = results.reduce((sum: number, die: any) => sum + die.value, 0) + modifier;
      
      setResult(total);
      
      if (onRollComplete) {
        onRollComplete(total);
      }
    } catch (error) {
      console.error("Ошибка при броске кубиков:", error);
    } finally {
      setIsRolling(false);
    }
  };
  
  return (
    <div className="dice-box-container w-full h-full flex flex-col relative">
      <div className="dice-canvas-container flex-grow relative overflow-hidden rounded-lg bg-black/20">
        <canvas ref={canvasRef} className="w-full h-full" />
        
        {result !== null && !isRolling && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full font-bold">
            Результат: {result}
          </div>
        )}
      </div>
      
      {!hideControls && (
        <div className="dice-controls mt-3">
          <Button 
            className="w-full gap-2" 
            onClick={handleRoll}
            disabled={isRolling}
            style={{ backgroundColor: actualThemeColor, color: '#000' }}
          >
            <Dices className="h-4 w-4" />
            {isRolling ? 'Бросаем...' : `Бросить ${diceCount}${diceType}${modifier !== 0 ? (modifier > 0 ? ' +' + modifier : ' ' + modifier) : ''}`}
          </Button>
        </div>
      )}
    </div>
  );
};

export default DiceBox3D;
