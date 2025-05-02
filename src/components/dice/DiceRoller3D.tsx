
import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

// Типы кубиков
type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';

type DiceModelProps = { 
  diceType: DiceType, 
  onRoll?: (result: number) => void,
  color?: string,
  rolling: boolean,
  setRolling: (rolling: boolean) => void,
  modifier?: number,
};

// Компонент кубика с использованием базовой геометрии
function DiceModel({ diceType, onRoll, color = '#ffffff', rolling, setRolling, modifier = 0 }: DiceModelProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [result, setResult] = useState<number | null>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [animationPhase, setAnimationPhase] = useState(0); // 0: initial, 1: rolling, 2: stopped
  const [rollStartTime, setRollStartTime] = useState(0);

  // Максимальное значение на кубике
  const getMaxValue = () => {
    switch (diceType) {
      case 'd4': return 4;
      case 'd6': return 6;
      case 'd8': return 8;
      case 'd10': return 10;
      case 'd12': return 12;
      case 'd20': return 20;
      default: return 6;
    }
  };

  // Получаем геометрию в зависимости от типа кубика
  const getDiceGeometry = () => {
    switch (diceType) {
      case 'd4':
        return new THREE.TetrahedronGeometry(1);
      case 'd6':
        return new THREE.BoxGeometry(1, 1, 1);
      case 'd8':
        return new THREE.OctahedronGeometry(1);
      case 'd10':
        // Для d10 используем конусную геометрию как приближение
        return new THREE.ConeGeometry(1, 2, 10);
      case 'd12':
        return new THREE.DodecahedronGeometry(1);
      case 'd20':
        return new THREE.IcosahedronGeometry(1);
      default:
        return new THREE.BoxGeometry(1, 1, 1);
    }
  };

  // Эффект для броска кубика
  useEffect(() => {
    if (rolling && animationPhase === 0) {
      setAnimationPhase(1);
      setRollStartTime(Date.now());
      setRotation({
        x: Math.random() * 10,
        y: Math.random() * 10,
        z: Math.random() * 10
      });
      setResult(null);
    }
  }, [rolling]);

  // Анимация кубика
  useFrame(() => {
    if (!meshRef.current) return;

    if (animationPhase === 1) {
      // Анимация броска
      meshRef.current.rotation.x += 0.2;
      meshRef.current.rotation.y += 0.3;
      meshRef.current.rotation.z += 0.1;
      
      // Проверяем, не пора ли остановить анимацию
      const elapsed = Date.now() - rollStartTime;
      if (elapsed > 1000) {
        setAnimationPhase(2);
        
        // Определяем результат броска
        const randomValue = Math.floor(Math.random() * getMaxValue()) + 1;
        setResult(randomValue);
        
        // Вызываем колбэк
        if (onRoll) {
          setTimeout(() => onRoll(randomValue), 500);
        }
        
        // Останавливаем бросок
        setTimeout(() => {
          setRolling(false);
          setAnimationPhase(0);
        }, 500);
      }
    } else if (animationPhase === 2) {
      // Замедление вращения
      meshRef.current.rotation.x *= 0.95;
      meshRef.current.rotation.y *= 0.95;
      meshRef.current.rotation.z *= 0.95;
    }
  });

  return (
    <group>
      <mesh ref={meshRef} position={[0, 0, 0]} castShadow>
        {getDiceGeometry()}
        <meshStandardMaterial 
          color={color} 
          metalness={0.5} 
          roughness={0.2}
          emissive={new THREE.Color(color).multiplyScalar(0.2)}
        />
      </mesh>
      
      {result !== null && !rolling && (
        <Text
          position={[0, 2, 0]}
          fontSize={0.8}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.04}
          outlineColor="#000000"
        >
          {result}{modifier !== 0 ? ` (${modifier > 0 ? '+' + modifier : modifier}) = ${result + modifier}` : ''}
        </Text>
      )}
    </group>
  );
}

// Основной компонент, экспортируемый из файла
export const DiceRoller3D: React.FC<{
  initialDice?: DiceType,
  hideControls?: boolean,
  modifier?: number,
  onRollComplete?: (result: number) => void,
  themeColor?: string,
  fixedPosition?: boolean,
  playerName?: string,
}> = ({
  initialDice = 'd20',
  hideControls = false,
  modifier = 0,
  onRollComplete,
  themeColor,
  fixedPosition = false,
  playerName,
}) => {
  const [diceType, setDiceType] = useState<DiceType>(initialDice);
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  const diceColor = themeColor || currentTheme.accent || '#4a9ef5';

  // Обработка выбора типа кубика
  const handleDiceChange = (type: DiceType) => {
    setDiceType(type);
  };

  // Обработка броска кубика
  const handleRoll = () => {
    if (!rolling) {
      setRolling(true);
    }
  };

  // Обработка результата броска
  const handleRollComplete = (diceResult: number) => {
    setResult(diceResult);
    if (onRollComplete) {
      onRollComplete(diceResult);
    }
  };

  // Автоматический бросок при первой загрузке
  useEffect(() => {
    if (initialDice && fixedPosition) {
      setTimeout(() => handleRoll(), 200);
    }
  }, [initialDice, fixedPosition]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas shadows camera={{ position: [0, 2, 5], fov: 45 }}>
        <color attach="background" args={['#000000']} />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <DiceModel 
          diceType={diceType} 
          color={diceColor}
          onRoll={handleRollComplete}
          rolling={rolling}
          setRolling={setRolling}
          modifier={modifier}
        />

        <OrbitControls 
          enablePan={false} 
          enableZoom={false} 
          enableRotate={!fixedPosition}
        />
      </Canvas>

      {!hideControls && (
        <>
          <div style={{ 
            position: 'absolute', 
            bottom: '60px', 
            left: 0, 
            width: '100%', 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '8px',
            background: 'rgba(0,0,0,0.5)',
            padding: '8px',
            borderRadius: '8px',
            zIndex: 10,
          }}>
            {(['d4', 'd6', 'd8', 'd10', 'd12', 'd20'] as DiceType[]).map((dice) => (
              <button 
                key={dice}
                onClick={() => handleDiceChange(dice)} 
                style={{ 
                  padding: '6px 10px', 
                  opacity: diceType === dice ? 1 : 0.6,
                  backgroundColor: diceType === dice ? diceColor : 'rgba(255,255,255,0.1)',
                  color: diceType === dice ? 'black' : 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: diceType === dice ? 'bold' : 'normal',
                  boxShadow: diceType === dice ? `0 0 10px ${diceColor}` : 'none'
                }}
              >{dice}</button>
            ))}
          </div>
          
          <button 
            onClick={handleRoll}
            disabled={rolling}
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '10px 20px',
              backgroundColor: rolling ? '#888888' : diceColor,
              color: 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: rolling ? 'default' : 'pointer',
              fontWeight: 'bold',
              boxShadow: rolling ? 'none' : `0 0 15px ${diceColor}80`,
              zIndex: 20,
              opacity: rolling ? 0.7 : 1
            }}
          >
            {rolling ? 'Бросаем...' : `Бросить ${diceType}`}
          </button>
        </>
      )}

      {playerName && result && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.7)',
          padding: '5px 10px',
          borderRadius: '4px',
          color: 'white',
          fontSize: '14px'
        }}>
          {playerName}
        </div>
      )}
    </div>
  );
};
