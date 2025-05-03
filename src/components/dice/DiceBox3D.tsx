
import React, { useEffect, useRef, useState } from 'react';
import DiceBox from "@3d-dice/dice-box";
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
  
  // Создаём градиентную тему на основе цвета темы
  const createGradientFromTheme = (baseColor: string) => {
    // Преобразуем HEX в HSL для создания градиента
    const hexToHSL = (hex: string) => {
      // Удаляем # если есть
      hex = hex.replace(/^#/, '');
      
      // Парсим RGB значения
      let r = parseInt(hex.substring(0, 2), 16) / 255;
      let g = parseInt(hex.substring(2, 4), 16) / 255;
      let b = parseInt(hex.substring(4, 6), 16) / 255;
      
      // Находим min и max
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      
      let h = 0, s = 0, l = (max + min) / 2;
      
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        
        h /= 6;
      }
      
      return [h * 360, s * 100, l * 100];
    };
    
    const hsl = hexToHSL(baseColor.replace('#', ''));
    // Создаём второй цвет для градиента, меняя оттенок
    const hsl2 = [
      (hsl[0] + 40) % 360, // Смещаем оттенок
      Math.min(hsl[1] + 10, 100), // Увеличиваем насыщенность
      Math.min(hsl[2] + 15, 90) // Делаем немного светлее
    ];
    
    return {
      primaryColor: baseColor,
      secondaryColor: `hsl(${hsl2[0]}, ${hsl2[1]}%, ${hsl2[2]}%)`
    };
  };
  
  const gradient = createGradientFromTheme(actualThemeColor);
  
  // Условная инициализация DiceBox только для видимых компонентов
  useEffect(() => {
    // Проверяем, что канвас существует
    if (!canvasRef.current) return;
    
    // Проверяем видимость элемента
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Инициализируем DiceBox только если компонент видим
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
        const canvasId = canvasIdRef.current;
        // Присваиваем ID к элементу canvas для корректной работы DiceBox
        if (canvasRef.current) {
          canvasRef.current.id = canvasId;
        }
        
        // Создаем экземпляр DiceBox используя селектор ID
        const diceBox = new DiceBox(`#${canvasId}`, {
          assetPath: "/assets/dice-models/", // Путь к ассетам
          modelFile: "dice-models-gltf.gltf", // Используем GLTF модель для реалистичных кубиков
          scale: 6,                         // Масштаб кубиков
          theme: "default",                 // Тема по умолчанию
          themeColor: {
            background: "transparent", 
            foreground: "#ffffff",
            // Используем градиент для кубиков
            material: {
              type: "gradient",
              colors: [gradient.primaryColor, gradient.secondaryColor],
              direction: "to right"
            } 
          },
          gravity: { x: 0, y: 0, z: -9.8 }, // Гравитация
          mass: 1,                          // Масса кубиков
          friction: 0.8,                    // Трение
          shadows: true,                    // Тени
          origin: { x: 0, y: 10, z: 0 },    // Начальная позиция
          lightIntensity: 1.5,              // Увеличенная интенсивность света для лучшего эффекта
          delay: 10,                        // Задержка между бросками
          // Добавляем настройки освещения для реализма
          lights: [
            { type: "ambient", intensity: 0.5 },
            { type: "directional", intensity: 1.2, position: { x: 5, y: 5, z: 5 } },
            { type: "point", intensity: 0.7, position: { x: -5, y: 3, z: -5 }, color: gradient.secondaryColor }
          ]
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
  }, [actualThemeColor, gradient]);
  
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
      <div className="dice-canvas-container flex-grow relative overflow-hidden rounded-lg bg-background/30 backdrop-blur-sm">
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
            style={{ 
              background: `linear-gradient(to right, ${gradient.primaryColor}, ${gradient.secondaryColor})`, 
              color: '#ffffff',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)'
            }}
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
