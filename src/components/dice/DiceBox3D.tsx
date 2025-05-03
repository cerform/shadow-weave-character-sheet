
import React, { useEffect, useRef, useState } from 'react';
import DiceBox from "@3d-dice/dice-box"; // Изменен с именованного импорта на импорт по умолчанию
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
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const diceBoxRef = useRef<any>(null);
  const canvasIdRef = useRef<string>(`dice-canvas-${Math.random().toString(36).substring(2, 9)}`);
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  const actualThemeColor = themeColor || currentTheme.accent;
  
  // Условная инициализация DiceBox только для видимых компонентов
  useEffect(() => {
    // Проверяем, что канвас существует и видим
    if (!canvasRef.current) return;
    
    // Проверяем видимость элемента
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          initDiceBox();
        }
      },
      { threshold: 0.1 }
    );
    
    // Начинаем наблюдение за канвасом
    observer.observe(canvasRef.current);
    
    // Функция для инициализации DiceBox
    const initDiceBox = () => {
      if (diceBoxRef.current) return; // Уже инициализирован
      
      try {
        // Присваиваем ID к элементу canvas
        const canvasId = canvasIdRef.current;
        if (canvasRef.current) {
          canvasRef.current.id = canvasId;
        }
        
        // Создаем экземпляр DiceBox используя селектор ID
        const diceBox = new DiceBox(`#${canvasId}`, {
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
        diceBox.initialize().then(() => {
          diceBoxRef.current = diceBox;
          console.log("DiceBox инициализирован успешно");
        }).catch((error: any) => {
          console.error("Ошибка при инициализации DiceBox:", error);
        });
      } catch (error) {
        console.error("Ошибка при создании DiceBox:", error);
      }
    };
    
    // Очистка при размонтировании
    return () => {
      observer.disconnect();
      if (diceBoxRef.current) {
        try {
          diceBoxRef.current.clear();
          diceBoxRef.current = null;
        } catch (e) {
          console.error("Ошибка при очистке DiceBox:", e);
        }
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
    <div className="dice-box-container w-full h-full flex flex-col relative" ref={containerRef}>
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
