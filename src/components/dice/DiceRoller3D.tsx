import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

// Компонент кубика
const Dice = ({ 
  type, 
  onRoll, 
  modifier = 0, 
  autoRoll = false, 
  hideControls = false, 
  forceReroll = false, 
  themeColor = '#ffffff',
  fixedPosition = false 
}: { 
  type: 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100',
  onRoll?: (result: number) => void,
  modifier?: number,
  autoRoll?: boolean,
  hideControls?: boolean,
  forceReroll?: boolean,
  themeColor?: string,
  fixedPosition?: boolean
}) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const initialPositionRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 3, 0));
  const targetPositionRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const throwForceRef = useRef<THREE.Vector3>(new THREE.Vector3(
    (Math.random() - 0.5) * 10,
    0,
    (Math.random() - 0.5) * 10
  ));
  
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState(0);
  const [readyToRoll, setReadyToRoll] = useState(true);
  const [rollPhase, setRollPhase] = useState(0); // 0: initial, 1: rolling, 2: settled
  
  // Преобразование HEX цвета в объект Color из Three.js
  const diceColor = new THREE.Color(themeColor);
  
  // Определение геометрии и числа граней для кубика
  const getDiceGeometry = (type: string) => {
    switch (type) {
      case 'd4':
        return new THREE.TetrahedronGeometry(1, 0);
      case 'd6':
        return new THREE.BoxGeometry(1, 1, 1);
      case 'd8':
        return new THREE.OctahedronGeometry(1, 0);
      case 'd10': {
        // Создаем упрощенную геометрию для d10
        const geometry = new THREE.ConeGeometry(0.8, 1.8, 10);
        return geometry;
      }
      case 'd12':
        return new THREE.DodecahedronGeometry(1, 0);
      case 'd20':
        return new THREE.IcosahedronGeometry(1, 0);
      case 'd100': {
        // Для d100 используем также геометрию d10
        const geometry = new THREE.ConeGeometry(0.8, 1.8, 10);
        return geometry;
      }
      default:
        return new THREE.BoxGeometry(1, 1, 1);
    }
  };
  
  const getMaxValue = (type: string) => {
    switch (type) {
      case 'd4': return 4;
      case 'd6': return 6;
      case 'd8': return 8;
      case 'd10': return 10;
      case 'd12': return 12;
      case 'd20': return 20;
      case 'd100': return 100;
      default: return 6;
    }
  };
  
  useEffect(() => {
    if (autoRoll || forceReroll) {
      rollDice();
    }
  }, [autoRoll, forceReroll]);
  
  const rollDice = () => {
    if (!readyToRoll) return;
    
    setRolling(true);
    setRollPhase(1);
    setReadyToRoll(false);
    
    // Сброс позиции и генерация новой силы броска
    if (meshRef.current) {
      meshRef.current.position.copy(initialPositionRef.current);
      throwForceRef.current = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        0,
        (Math.random() - 0.5) * 10
      );
    }
    
    // Определяем результат броска
    const maxValue = getMaxValue(type);
    let newResult = Math.floor(Math.random() * maxValue) + 1;
    
    // Для d100, умножаем результат на 10
    if (type === 'd100') {
      newResult = newResult * 10;
    }
    
    // Таймер для "остановки" кубика
    setTimeout(() => {
      setResult(newResult);
      setRollPhase(2);
      
      if (onRoll) {
        onRoll(newResult);
      }
      
      // Позволяем бросить кубик снова через небольшую задержку
      setTimeout(() => {
        setRolling(false);
        setReadyToRoll(true);
        setRollPhase(0);
      }, 500);
    }, 1000);
  };
  
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    
    if (rolling && rollPhase === 1) {
      // Когда кубик катится
      meshRef.current.rotation.x += throwForceRef.current.x * delta;
      meshRef.current.rotation.y += 5 * delta;
      meshRef.current.rotation.z += throwForceRef.current.z * delta;
      
      // Движение к целевой позиции
      meshRef.current.position.lerp(targetPositionRef.current, 0.1);
    } else if (rollPhase === 2) {
      // Замедляем вращение когда кубик "остановился"
      meshRef.current.rotation.x *= 0.95;
      meshRef.current.rotation.y *= 0.95;
      meshRef.current.rotation.z *= 0.95;
    } else {
      // Добавляем небольшое вращение в неактивном состоянии для эффекта "живости"
      meshRef.current.rotation.y += 0.005;
    }
  });
  
  // Центрирование камеры на кубике
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 0, 5); // Задаем оптимальную позицию камеры
    camera.lookAt(0, 0, 0);
  }, [camera]);
  
  // Создаем материал с цветом темы и улучшенными настройками
  const diceMaterial = new THREE.MeshStandardMaterial({
    color: diceColor,
    metalness: 0.7,
    roughness: 0.3,
    emissive: new THREE.Color(diceColor).multiplyScalar(0.2),
  });
  
  // В случае фиксированной позиции, не отображаем результат на сцене
  const shouldDisplayResult = !fixedPosition && result > 0 && !rolling;

  return (
    <group>
      <mesh ref={meshRef} position={[0, 0, 0]} castShadow receiveShadow>
        <primitive object={getDiceGeometry(type)} />
        <primitive object={diceMaterial} attach="material" />
      </mesh>
      
      {!hideControls && (
        <group position={[0, -2, 0]}>
          <mesh position={[0, 0, 0]} onClick={rollDice} onPointerOver={() => document.body.style.cursor = 'pointer'} onPointerOut={() => document.body.style.cursor = 'default'}>
            <boxGeometry args={[2.5, 0.5, 1]} />
            <meshStandardMaterial color={readyToRoll ? "#4CAF50" : "#9E9E9E"} />
          </mesh>
          <Text position={[0, 0, 0.6]} fontSize={0.2} color="#FFFFFF">
            {readyToRoll ? "Бросить" : "..."}
          </Text>
        </group>
      )}
      
      {shouldDisplayResult && (
        <group position={[0, 1.5, 0]}>
          <Text position={[0, 0, 0]} fontSize={0.5} color={themeColor} anchorX="center" anchorY="middle">
            {result + (modifier !== 0 ? ` (${modifier > 0 ? '+' + modifier : modifier}) = ${result + modifier}` : '')}
          </Text>
        </group>
      )}
    </group>
  );
};

interface DiceRoller3DProps {
  initialDice?: 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100';
  hideControls?: boolean;
  modifier?: number;
  onRollComplete?: (result: number) => void;
  themeColor?: string;
  fixedPosition?: boolean;
  playerName?: string;
  diceCount?: number;
  forceReroll?: boolean;
}

export const DiceRoller3D = ({ 
  initialDice = 'd20', 
  hideControls = false, 
  modifier = 0, 
  onRollComplete,
  themeColor = '#ffffff',
  fixedPosition = false,
  playerName,
  diceCount = 1,
  forceReroll = false
}: DiceRoller3DProps) => {
  const [diceType, setDiceType] = useState<'d4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100'>(initialDice);
  const [roll, setRoll] = useState(false);
  const [internalForceReroll, setInternalForceReroll] = useState(false);
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  const actualThemeColor = themeColor || currentTheme.accent;
  
  // Обновляем состояние при изменении initialDice извне
  useEffect(() => {
    setDiceType(initialDice);
  }, [initialDice]);
  
  // Реакция на внешний forceReroll
  useEffect(() => {
    if (forceReroll) {
      setInternalForceReroll(prev => !prev);
    }
  }, [forceReroll]);
  
  const handleDiceChange = (type: 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100') => {
    setDiceType(type);
    setInternalForceReroll(prev => !prev); // Reset the dice when changing type
  };
  
  const handleRoll = () => {
    setRoll(true);
    setInternalForceReroll(prev => !prev); // Переключаем, чтобы вызвать эффект перебрасывания
  };
  
  const handleRollComplete = (result: number) => {
    setRoll(false);
    if (onRollComplete) {
      onRollComplete(result);
    }
    
    // Log the roll with player name if available
    if (playerName) {
      console.log(`${playerName} rolled a ${result}${modifier !== 0 ? ` (${modifier > 0 ? '+' + modifier : modifier}) = ${result + modifier}` : ''}`);
    }
  };
  
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas shadows className={fixedPosition ? "dice-fixed-position" : ""}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} castShadow />
        <Dice 
          type={diceType} 
          onRoll={handleRollComplete}
          modifier={modifier}
          autoRoll={roll}
          hideControls={hideControls}
          forceReroll={internalForceReroll}
          themeColor={actualThemeColor}
          fixedPosition={fixedPosition}
        />
        {!fixedPosition && <OrbitControls enablePan={false} enableZoom={false} />}
      </Canvas>
      
      {!hideControls && (
        <div className="flex justify-center gap-2 mt-2">
          <Button size="sm" onClick={handleRoll} className="px-4 py-2 rounded-md shadow-md">
            Бросить {diceType}
          </Button>
        </div>
      )}
    </div>
  );
};

export default DiceRoller3D;
