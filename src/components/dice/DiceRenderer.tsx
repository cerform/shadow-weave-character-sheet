import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Dices } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SelectionSubOption } from '@/components/ui/selection-card';
import GradientDice from './GradientDice';

// Типы кубиков D&D
const DICE_TYPES = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'] as const;
type DiceType = typeof DICE_TYPES[number];

interface DiceRendererProps {
  onRollComplete?: (result: number, diceType: DiceType) => void;
  compact?: boolean;
  defaultDiceType?: DiceType;
  defaultDiceCount?: number;
  showControls?: boolean;
  fixedPosition?: boolean;
  height?: string | number;
  width?: string | number;
  className?: string;
  themeColor?: string; // Добавлен themeColor prop
}

const DiceScene = ({
  diceType,
  diceCount = 1,
  rolling,
  onRollComplete,
  themeColor = '#ffffff'
}: {
  diceType: DiceType;
  diceCount?: number;
  rolling: boolean;
  onRollComplete?: (result: number) => void;
  themeColor?: string;
}) => {
  const maxValue = {
    'd4': 4,
    'd6': 6,
    'd8': 8,
    'd10': 10,
    'd12': 12,
    'd20': 20
  };
  
  const [results, setResults] = useState<number[]>([]);
  
  // Генерируем результаты при броске
  useEffect(() => {
    if (rolling) {
      const newResults = Array(diceCount).fill(0).map(() => 
        Math.floor(Math.random() * maxValue[diceType]) + 1
      );
      setResults(newResults);
    }
  }, [rolling, diceType, diceCount]);
  
  // Рассчитываем позиции для нескольких кубиков
  const getDicePositions = (count: number): [number, number, number][] => {
    if (count === 1) return [[0, 0, 0]];
    
    const positions: [number, number, number][] = [];
    const radius = Math.min(1.5, count * 0.3);
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      positions.push([
        Math.sin(angle) * radius,
        0,
        Math.cos(angle) * radius
      ]);
    }
    
    return positions;
  };
  
  const positions = getDicePositions(diceCount);
  
  // Отправляем результат наверх
  useEffect(() => {
    if (!rolling && onRollComplete && results.length > 0) {
      const total = results.reduce((sum, result) => sum + result, 0);
      onRollComplete(total);
    }
  }, [rolling, onRollComplete, results]);
  
  // Настройка освещения и камеры
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 3, 5);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  
  const totalResult = results.reduce((sum, result) => sum + result, 0);
  
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      
      {positions.map((position, index) => (
        <DiceModel 
          key={index}
          diceType={diceType}
          position={position}
          rolling={rolling}
          themeColor={themeColor}
          result={results[index]}
        />
      ))}
      
      {!rolling && totalResult > 0 && (
        <Text
          position={[0, 2, 0]}
          color={themeColor}
          fontSize={0.5}
          anchorX="center"
          anchorY="middle"
        >
          {totalResult}
        </Text>
      )}
      
      <OrbitControls 
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={10}
        autoRotate={!rolling}
        autoRotateSpeed={1}
      />
    </>
  );
};

// Использующий SimpleDiceRenderer для отрисовки модели кубика
const DiceModel = ({
  diceType,
  position = [0, 0, 0],
  rolling = false,
  onStopRolling,
  themeColor = '#ffffff',
  result
}: {
  diceType: DiceType;
  position?: [number, number, number];
  rolling?: boolean;
  onStopRolling?: (result: number) => void;
  themeColor?: string;
  result?: number;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [rotationSpeed] = useState(() => ({
    x: Math.random() * 0.3 + 0.1,
    y: Math.random() * 0.3 + 0.1,
    z: Math.random() * 0.3 + 0.1
  }));
  
  // Материал кубика, зависящий от темы
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(themeColor),
    metalness: 0.7,
    roughness: 0.3,
    emissive: new THREE.Color(themeColor).multiplyScalar(0.2)
  });
  
  // Анимация броска кубика
  useFrame((_, delta) => {
    if (!meshRef.current || !rolling) return;
    
    meshRef.current.rotation.x += rotationSpeed.x * delta * 5;
    meshRef.current.rotation.y += rotationSpeed.y * delta * 5;
    meshRef.current.rotation.z += rotationSpeed.z * delta * 5;
  });
  
  // Отображение результата броска
  useEffect(() => {
    if (!rolling && onStopRolling && result) {
      onStopRolling(result);
    }
  }, [rolling, onStopRolling, result]);
  
  // Используем заглушки для моделей, когда нет GLTF моделей
  const renderDicePlaceholder = () => {
    switch(diceType) {
      case 'd4':
        return <tetrahedronGeometry args={[1, 0]} />;
      case 'd6':
        return <boxGeometry args={[1, 1, 1]} />;
      case 'd8':
        return <octahedronGeometry args={[1, 0]} />;
      case 'd10':
        return <coneGeometry args={[0.8, 2, 10]} />;
      case 'd12':
        return <dodecahedronGeometry args={[1, 0]} />;
      case 'd20':
        return <icosahedronGeometry args={[1, 0]} />;
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  };
  
  return (
    <mesh ref={meshRef} position={new THREE.Vector3(...position)}>
      {renderDicePlaceholder()}
      <primitive object={material} attach="material" />
    </mesh>
  );
};

export const DiceRenderer: React.FC<DiceRendererProps> = ({
  onRollComplete,
  compact = false,
  defaultDiceType = 'd20',
  defaultDiceCount = 1,
  showControls = true,
  fixedPosition = false,
  height = '300px',
  width = '100%',
  className = '',
  themeColor // Используем переданный themeColor
}) => {
  const [diceType, setDiceType] = useState<DiceType>(defaultDiceType);
  const [diceCount, setDiceCount] = useState(defaultDiceCount);
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  // Используем переданный themeColor или берем из текущей темы
  const actualThemeColor = themeColor || currentTheme?.accent || '#ffffff';
  
  const handleRollDice = () => {
    setRolling(true);
    setResult(null);
    
    // Эмуляция длительности броска
    setTimeout(() => {
      setRolling(false);
    }, 1200);
  };
  
  const handleRollComplete = (total: number) => {
    setResult(total);
    if (onRollComplete) onRollComplete(total, diceType);
  };
  
  // Используем SimpleDiceRenderer для отображения кубика, если не нужен полный 3D рендер
  const showSimpleDice = compact && !rolling;
  
  return (
    <div 
      className={`dice-renderer relative ${className}`} 
      style={{ 
        height, 
        width,
        position: fixedPosition ? 'fixed' : 'relative',
        overflow: 'hidden',
      }}
    >
      {showSimpleDice ? (
        <div className="flex flex-col items-center justify-center h-full">
          <GradientDice 
            diceType={diceType}
            size={100}
            color1={actualThemeColor}
            color2={actualThemeColor}
          />
          {result !== null && (
            <div className="mt-2 text-center font-bold text-lg" style={{ color: actualThemeColor }}>
              {result}
            </div>
          )}
        </div>
      ) : (
        <Canvas shadows style={{ background: 'transparent' }}>
          <DiceScene 
            diceType={diceType}
            diceCount={diceCount}
            rolling={rolling}
            onRollComplete={handleRollComplete}
            themeColor={actualThemeColor}
          />
        </Canvas>
      )}
      
      {showControls && (
        <div className="absolute left-0 bottom-0 w-full p-2 bg-black/30 backdrop-blur-sm">
          <div className="flex flex-wrap justify-center gap-1 mb-2">
            {DICE_TYPES.map((type) => (
              <SelectionSubOption
                key={type}
                label={type}
                selected={diceType === type}
                onClick={() => setDiceType(type)}
                style={{
                  backgroundColor: diceType === type ? actualThemeColor : 'rgba(255,255,255,0.1)',
                  color: diceType === type ? '#000' : '#fff',
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.5rem'
                }}
              />
            ))}
          </div>
          
          {!compact && (
            <div className="flex items-center justify-between px-2 mb-2">
              <div className="text-xs text-white">Количество:</div>
              <div className="flex items-center gap-1">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setDiceCount(Math.max(1, diceCount - 1))}
                  className="h-6 w-6 p-0 text-white"
                >
                  -
                </Button>
                <span className="w-5 text-center text-white">{diceCount}</span>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setDiceCount(Math.min(5, diceCount + 1))}
                  className="h-6 w-6 p-0 text-white"
                >
                  +
                </Button>
              </div>
            </div>
          )}
          
          <Button 
            className="w-full" 
            variant="default"
            onClick={handleRollDice}
            disabled={rolling}
            style={{ backgroundColor: actualThemeColor, color: '#000' }}
          >
            <Dices className="mr-1" size={16} />
            {rolling ? 'Бросаем...' : `Бросить ${diceCount}${diceType}`}
          </Button>
          
          {result !== null && !rolling && !compact && (
            <div className="mt-2 text-center font-bold text-lg" style={{ color: actualThemeColor }}>
              Результат: {result}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DiceRenderer;
