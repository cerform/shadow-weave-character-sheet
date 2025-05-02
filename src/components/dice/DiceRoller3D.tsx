
import React, { useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics, RigidBody } from '@react-three/rapier';
import { useGLTF, Text, Environment, Center, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

// Типы кубиков
type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';
type DiceModelProps = { 
  position?: [number, number, number], 
  onRoll?: (result: number) => void,
  diceType: DiceType, 
  color?: string,
  rolling: boolean,
  setRolling: (rolling: boolean) => void,
  forceReroll?: boolean,
  modifier?: number,
};

// Используем готовые модели для каждого типа кубика
function DiceModel({ position = [0, 0, 0], diceType, onRoll, color = '#ffffff', rolling, setRolling, forceReroll, modifier = 0 }: DiceModelProps) {
  const rigidBodyRef = useRef<any>(null);
  const [result, setResult] = useState<number | null>(null);
  const [lastPosition, setLastPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [staticTimer, setStaticTimer] = useState<NodeJS.Timeout | null>(null);
  const [rollKey, setRollKey] = useState(0);
  const [isStatic, setIsStatic] = useState(false);

  // Загружаем модель кубика
  const modelPath = `/models/dice/${diceType.replace('d', '')}.glb`;
  const { scene } = useGLTF(modelPath);
  const diceModel = scene.clone();

  // Определяем материал для кубика
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    metalness: 0.1,
    roughness: 0.5,
  });

  // Применяем материал ко всем мешам в модели
  diceModel.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.material = material;
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

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

  // Определяем результат броска на основе ориентации кубика
  const determineResult = () => {
    if (!rigidBodyRef.current) return 1;
    
    const diceRotation = rigidBodyRef.current.rotation();
    let value = 1;

    // Для разных типов кубиков разные правила определения результата
    switch (diceType) {
      case 'd4':
        // Для d4 определяем по вершине, которая направлена вверх
        if (diceRotation.x > 1) value = 1;
        else if (diceRotation.y > 1) value = 2;
        else if (diceRotation.z > 1) value = 3;
        else value = 4;
        break;
      case 'd6':
        // Для d6 определяем по грани, которая направлена вверх
        if (Math.abs(diceRotation.x) > Math.abs(diceRotation.y) && Math.abs(diceRotation.x) > Math.abs(diceRotation.z)) {
          value = diceRotation.x > 0 ? 6 : 1;
        } else if (Math.abs(diceRotation.y) > Math.abs(diceRotation.x) && Math.abs(diceRotation.y) > Math.abs(diceRotation.z)) {
          value = diceRotation.y > 0 ? 5 : 2;
        } else {
          value = diceRotation.z > 0 ? 4 : 3;
        }
        break;
      case 'd20':
        // Для d20 просто выбираем случайное число, так как сложно определить ориентацию
        value = Math.floor(Math.random() * 20) + 1;
        break;
      default:
        // Для остальных кубиков тоже используем случайное число
        value = Math.floor(Math.random() * getMaxValue()) + 1;
    }

    return value;
  };

  // Эффект для броска кубика
  useEffect(() => {
    if (rolling) {
      setRolling(true);
      setResult(null);
      setIsStatic(false);

      // Применяем случайный импульс для броска
      if (rigidBodyRef.current) {
        rigidBodyRef.current.setTranslation({ x: 0, y: 3, z: 0 }, true);
        rigidBodyRef.current.setRotation({ x: Math.random(), y: Math.random(), z: Math.random(), w: Math.random() }, true);
        
        const impulseX = (Math.random() - 0.5) * 2;
        const impulseY = Math.random() * 3 + 3;
        const impulseZ = (Math.random() - 0.5) * 2;
        
        rigidBodyRef.current.applyImpulse({ x: impulseX, y: impulseY, z: impulseZ }, true);
        rigidBodyRef.current.applyTorqueImpulse({ x: impulseX * 2, y: impulseY * 0.5, z: impulseZ * 2 }, true);
      }
      
      // Сбрасываем статический таймер
      if (staticTimer) {
        clearTimeout(staticTimer);
      }
    }
  }, [rolling, forceReroll, rollKey]);

  // Обработка остановки кубика
  useEffect(() => {
    const handleSettled = () => {
      if (isStatic && rolling) {
        const finalResult = determineResult();
        setResult(finalResult);
        setRolling(false);
        
        if (onRoll) {
          onRoll(finalResult);
        }
      }
    };

    if (isStatic) {
      const timer = setTimeout(handleSettled, 500);
      return () => clearTimeout(timer);
    }
  }, [isStatic, rolling]);

  // Проверка на прекращение движения кубика
  useEffect(() => {
    const checkForStatic = () => {
      if (rigidBodyRef.current) {
        const linVel = rigidBodyRef.current.linvel();
        const speed = Math.sqrt(linVel.x ** 2 + linVel.y ** 2 + linVel.z ** 2);
        
        const angVel = rigidBodyRef.current.angvel();
        const angSpeed = Math.sqrt(angVel.x ** 2 + angVel.y ** 2 + angVel.z ** 2);
        
        const pos = rigidBodyRef.current.translation();
        const currentPos: [number, number, number] = [pos.x, pos.y, pos.z];
        
        const posChange = Math.sqrt(
          (currentPos[0] - lastPosition[0]) ** 2 +
          (currentPos[1] - lastPosition[1]) ** 2 +
          (currentPos[2] - lastPosition[2]) ** 2
        );
        
        setLastPosition(currentPos);
        
        if (rolling && speed < 0.1 && angSpeed < 0.1 && posChange < 0.01) {
          setIsStatic(true);
        } else {
          setIsStatic(false);
        }
      }
    };

    const interval = setInterval(checkForStatic, 200);
    return () => clearInterval(interval);
  }, [rolling, lastPosition]);

  return (
    <RigidBody 
      ref={rigidBodyRef} 
      colliders="hull" 
      position={position} 
      restitution={0.5}
      friction={0.5}
    >
      <primitive object={diceModel} scale={[0.7, 0.7, 0.7]} />
      
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
    </RigidBody>
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
  const [forceReroll, setForceReroll] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  const diceColor = themeColor || currentTheme.accent || '#4a9ef5';

  // Обработка выбора типа кубика
  const handleDiceChange = (type: DiceType) => {
    setDiceType(type);
    setForceReroll(prev => !prev);
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
        
        <Physics gravity={[0, -9.81, 0]}>
          <DiceModel 
            position={[0, 3, 0]} 
            diceType={diceType} 
            color={diceColor}
            onRoll={handleRollComplete}
            rolling={rolling}
            setRolling={setRolling}
            forceReroll={forceReroll}
            modifier={modifier}
          />
          
          {/* Пол для физики */}
          <RigidBody type="fixed" position={[0, -1, 0]} restitution={0.5}>
            <mesh receiveShadow>
              <boxGeometry args={[10, 0.5, 10]} />
              <meshStandardMaterial color="#111111" opacity={0.2} transparent />
            </mesh>
          </RigidBody>
        </Physics>

        <Environment preset="studio" />
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

// Предзагрузка моделей для оптимизации
useGLTF.preload('/models/dice/4.glb');
useGLTF.preload('/models/dice/6.glb');
useGLTF.preload('/models/dice/8.glb');
useGLTF.preload('/models/dice/10.glb');
useGLTF.preload('/models/dice/12.glb');
useGLTF.preload('/models/dice/20.glb');
