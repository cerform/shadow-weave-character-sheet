
import React, { useEffect, useState, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import * as DiceBoxModule from "@3d-dice/dice-box";
import { Spinner } from "../ui/spinner";

interface DiceBox3DProps {
  diceType?: 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';
  diceCount?: number;
  modifier?: number;
  onRollComplete?: (result: number) => void;
  themeColor?: string;
  fixedPosition?: boolean;
  hideControls?: boolean;
}

// Создаем тип для опций DiceBox из библиотеки
type DiceBoxOptions = {
  theme: string;
  throwForce: number;
  gravity: number;
  linearAngularFactor: number;
  spinForce: number;
  mass: number;
  inertia: number;
  timeInterval: number;
  hiddenDice: boolean;
  onRollFinished: () => void;
  onReroll: () => void;
  onRolled: () => void;
  enableShadows: boolean;
  shadowTransparency: number;
  friction: number;
  collisionIterations: number;
  spinPeriod: number;
  lightIntensity: number;
  scale: number;
  themeColor?: string;
};

// Настройки кубика по умолчанию
const diceOptions: DiceBoxOptions = {
  theme: "default",
  throwForce: 10,
  gravity: 4,
  linearAngularFactor: 0.35,
  spinForce: 6,
  mass: 1,
  inertia: 13,
  timeInterval: 0.2,
  hiddenDice: false,
  onRollFinished: () => {},
  onReroll: () => {},
  onRolled: () => {},
  enableShadows: true,
  shadowTransparency: 0.7,
  friction: 2,
  collisionIterations: 5,
  spinPeriod: 1500,
  lightIntensity: 1,
  scale: 45,
};

const DiceScene = ({
  diceManager,
  diceType = 'd20',
  diceCount = 1,
  modifier = 0,
  onRollComplete,
  themeColor,
  fixedPosition = false,
  hideControls = false,
}) => {
  const { camera, gl } = useThree();
  const prevDiceType = useRef(diceType);
  const prevDiceCount = useRef(diceCount);
  const [isRolling, setIsRolling] = useState(false);
  const [displayValue, setDisplayValue] = useState<number | null>(null);

  // Инициализация системы кубиков
  useEffect(() => {
    (async () => {
      if (!diceManager.current) {
        // Создаем экземпляр DiceBox
        diceManager.current = new DiceBoxModule.default("#dice-canvas", {
          ...diceOptions,
          themeColor: themeColor || '#8B5A2B',
        });

        // Инициализация
        await diceManager.current.init();

        // Устанавливаем обработчик окончания броска
        diceManager.current.onRollComplete = (results) => {
          if (results && results.length > 0) {
            // Суммируем результаты всех кубиков и добавляем модификатор
            const rollTotal = results.reduce((sum, die) => sum + die.value, 0) + (modifier || 0);
            setDisplayValue(rollTotal);
            setIsRolling(false);
            if (onRollComplete) onRollComplete(rollTotal);
          }
        };
      }
    })();

    return () => {
      // При размонтировании компонента удаляем все кубики
      if (diceManager.current) {
        diceManager.current.clear();
      }
    };
  }, [themeColor]);

  // Обновляем параметры кубика при изменении размера или типа
  useEffect(() => {
    if (
      diceManager.current &&
      (prevDiceType.current !== diceType || prevDiceCount.current !== diceCount)
    ) {
      // Удаляем старые кубики и создаем новые
      diceManager.current.clear();
      prevDiceType.current = diceType;
      prevDiceCount.current = diceCount;
      
      // Запускаем новый бросок с новыми параметрами
      handleRoll();
    }
  }, [diceType, diceCount]);

  // Функция для броска кубиков
  const handleRoll = async () => {
    if (diceManager.current) {
      setIsRolling(true);
      setDisplayValue(null);
      
      // Формируем нотацию для броска (например, "2d20+3")
      const notation = `${diceCount}${diceType}${modifier > 0 ? '+' + modifier : modifier < 0 ? modifier : ''}`;
      
      try {
        // Выполняем бросок с заданной нотацией
        await diceManager.current.roll(notation);
      } catch (error) {
        console.error("Ошибка при броске кубиков:", error);
        setIsRolling(false);
      }
    }
  };

  // Создаем контейнер для кубиков с заданными размерами
  return (
    <div 
      onClick={handleRoll} 
      className="w-full h-full cursor-pointer flex flex-col items-center justify-center relative"
    >
      {/* Отображаем результат броска */}
      {displayValue !== null && !isRolling && (
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                     text-4xl font-bold z-10 bg-black/50 p-3 rounded-full h-20 w-20
                     flex items-center justify-center"
          style={{ color: themeColor || '#8B5A2B', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
        >
          {displayValue}
        </div>
      )}
      
      {/* Отображаем спиннер во время броска */}
      {isRolling && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <Spinner size="lg" />
        </div>
      )}
      
      {/* Canvas для отображения 3D кубиков */}
      <div id="dice-canvas" className={`w-full h-full ${fixedPosition ? 'absolute inset-0' : ''}`} />
      
      {/* Информация о текущем броске */}
      {!hideControls && (
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 
                      bg-black/70 px-3 py-1 rounded-full text-xs text-white/90">
          Бросок: {diceCount}{diceType}{modifier > 0 ? `+${modifier}` : modifier < 0 ? modifier : ''}
        </div>
      )}
    </div>
  );
};

export const DiceBox3D: React.FC<DiceBox3DProps> = ({
  diceType = 'd20',
  diceCount = 1,
  modifier = 0,
  onRollComplete,
  themeColor,
  fixedPosition,
  hideControls = false,
}) => {
  const diceManager = useRef<any>(null);

  return (
    <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <DiceScene
        diceManager={diceManager}
        diceType={diceType}
        diceCount={diceCount}
        modifier={modifier}
        onRollComplete={onRollComplete}
        themeColor={themeColor}
        fixedPosition={fixedPosition}
        hideControls={hideControls}
      />
    </Canvas>
  );
};

export default DiceBox3D;
