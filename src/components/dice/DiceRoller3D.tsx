
import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
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
  playerName?: string,
};

// Кастомная геометрия для d10 (улучшенная)
const createD10Geometry = () => {
  const geometry = new THREE.BufferGeometry();
  
  // Создаем пентагональную трапецоэдру для d10
  const vertices = [];
  const indices = [];
  
  // Верхняя вершина
  vertices.push(0, 1.2, 0);
  
  // Верхний пентагон
  for (let i = 0; i < 5; i++) {
    const angle = (Math.PI * 2 / 5) * i;
    vertices.push(
      0.85 * Math.cos(angle),
      0.3,
      0.85 * Math.sin(angle)
    );
  }
  
  // Нижний пентагон (повернут на 36 градусов)
  for (let i = 0; i < 5; i++) {
    const angle = (Math.PI * 2 / 5) * (i + 0.5);
    vertices.push(
      0.85 * Math.cos(angle),
      -0.3,
      0.85 * Math.sin(angle)
    );
  }
  
  // Нижняя вершина
  vertices.push(0, -1.2, 0);
  
  // Грани (верхняя половина)
  for (let i = 0; i < 5; i++) {
    const next = (i + 1) % 5;
    indices.push(0, i + 1, next + 1);
    indices.push(i + 1, i + 6, next + 1);
    indices.push(next + 1, i + 6, next + 6);
  }
  
  // Грани (нижняя половина)
  for (let i = 0; i < 5; i++) {
    const next = (i + 1) % 5;
    indices.push(11, i + 6, next + 6);
  }
  
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  
  return geometry;
};

// Создаем улучшенную геометрию для d4
const createD4Geometry = () => {
  const geometry = new THREE.TetrahedronGeometry(1.2);
  return geometry;
};

// Компонент кубика с индивидуальными геометриями
function DiceModel({ diceType, onRoll, color = '#ffffff', rolling, setRolling, modifier = 0, playerName }: DiceModelProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [result, setResult] = useState<number | null>(null);
  const [animationPhase, setAnimationPhase] = useState(0); // 0: initial, 1: rolling, 2: slowing, 3: stopped
  const [rollStartTime, setRollStartTime] = useState(0);
  const [rotationSpeed, setRotationSpeed] = useState({ x: 0, y: 0, z: 0 });
  
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

  // Эффект для броска кубика
  useEffect(() => {
    if (rolling && animationPhase === 0) {
      setAnimationPhase(1);
      setRollStartTime(Date.now());
      setRotationSpeed({
        x: Math.random() * 5 + 2,
        y: Math.random() * 5 + 2,
        z: Math.random() * 5 + 2
      });
      setResult(null);
      
      // Случайное начальное положение
      if (meshRef.current) {
        meshRef.current.rotation.x = Math.random() * Math.PI * 2;
        meshRef.current.rotation.y = Math.random() * Math.PI * 2;
        meshRef.current.rotation.z = Math.random() * Math.PI * 2;
      }
    }
  }, [rolling, animationPhase]);

  // Анимация кубика с замедлением
  useFrame((_, delta) => {
    if (!meshRef.current) return;

    const elapsed = Date.now() - rollStartTime;
    
    if (animationPhase === 1) {
      // Быстрое вращение в начале броска
      meshRef.current.rotation.x += rotationSpeed.x * delta;
      meshRef.current.rotation.y += rotationSpeed.y * delta;
      meshRef.current.rotation.z += rotationSpeed.z * delta;
      
      // Переход к фазе замедления через 1.2 секунды
      if (elapsed > 1200) {
        setAnimationPhase(2);
      }
    } else if (animationPhase === 2) {
      // Фаза замедления (1.2-2.5 секунды)
      const slowdownFactor = Math.max(0.1, 1 - (elapsed - 1200) / 1300);
      
      meshRef.current.rotation.x += rotationSpeed.x * delta * slowdownFactor;
      meshRef.current.rotation.y += rotationSpeed.y * delta * slowdownFactor;
      meshRef.current.rotation.z += rotationSpeed.z * delta * slowdownFactor;
      
      // Остановка вращения и определение результата
      if (elapsed > 2500) {
        setAnimationPhase(3);
        
        // Определяем результат броска
        const randomValue = Math.floor(Math.random() * getMaxValue()) + 1;
        setResult(randomValue);
        
        // Выравниваем кубик к ближайшей "правильной" ориентации для визуализации
        // В реальном приложении здесь можно добавить более точное выравнивание по граням
        
        // Вызываем колбэк
        if (onRoll) {
          onRoll(randomValue);
        }
        
        // Завершаем бросок
        setTimeout(() => {
          setRolling(false);
          setAnimationPhase(0);
        }, 500);
      }
    }
  });

  // Создаем геометрию для разных типов кубиков
  const renderDiceGeometry = () => {
    switch (diceType) {
      case 'd4':
        return <primitive object={createD4Geometry()} />;
      case 'd6':
        return <boxGeometry args={[1.1, 1.1, 1.1]} />;
      case 'd8':
        return <octahedronGeometry args={[1.1]} />;
      case 'd10':
        return <primitive object={createD10Geometry()} />;
      case 'd12':
        return <dodecahedronGeometry args={[1]} />;
      case 'd20':
        return <icosahedronGeometry args={[1]} />;
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  };

  // Получаем цвет для метки числа кубика
  const getLabelColor = () => {
    // Контрастный цвет для метки
    const labelColor = new THREE.Color(color).getHSL({ h: 0, s: 0, l: 0 });
    labelColor.l = labelColor.l > 0.5 ? 0.1 : 0.9;
    return new THREE.Color().setHSL(labelColor.h, labelColor.s, labelColor.l);
  };

  // Добавляем подсветку для выделения граней
  const edgeLight = new THREE.Color(color).clone().multiplyScalar(1.3);

  return (
    <group>
      <mesh ref={meshRef} position={[0, 0, 0]} castShadow receiveShadow>
        {renderDiceGeometry()}
        <meshStandardMaterial 
          color={new THREE.Color(color)} 
          metalness={0.3} 
          roughness={0.4}
          emissive={new THREE.Color(color).multiplyScalar(0.2)}
          envMapIntensity={0.8}
          flatShading={false}
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

  // Определяем цвета для разных типов кубиков
  const getDiceColor = (type: DiceType) => {
    // Можно настроить разные цвета для разных типов кубиков
    switch (type) {
      case 'd4': return diceType === 'd4' ? '#B0E0E6' : '#90CAD1';
      case 'd6': return diceType === 'd6' ? '#98FB98' : '#7DCF7D';
      case 'd8': return diceType === 'd8' ? '#FFA07A' : '#E08A68';
      case 'd10': return diceType === 'd10' ? '#DDA0DD' : '#C98AC9';
      case 'd12': return diceType === 'd12' ? '#FFD700' : '#E6C200';
      case 'd20': return diceType === 'd20' ? '#87CEEB' : '#6BBCE6';
      default: return diceColor;
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas shadows camera={{ position: [0, 2, 5], fov: 45 }}>
        <color attach="background" args={['#000000']} />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <DiceModel 
          diceType={diceType} 
          color={getDiceColor(diceType)}
          onRoll={handleRollComplete}
          rolling={rolling}
          setRolling={setRolling}
          modifier={modifier}
          playerName={playerName}
        />

        <OrbitControls 
          enablePan={false} 
          enableZoom={false} 
          enableRotate={!fixedPosition}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI * 5/6}
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
            {(['d4', 'd6', 'd8', 'd10', 'd12', 'd20'] as DiceType[]).map((dice) => {
              const isActive = diceType === dice;
              const diceSpecificColor = getDiceColor(dice);
              
              return (
                <button 
                  key={dice}
                  onClick={() => handleDiceChange(dice)} 
                  style={{ 
                    padding: '6px 10px', 
                    opacity: isActive ? 1 : 0.8,
                    backgroundColor: isActive ? diceSpecificColor : 'rgba(255,255,255,0.1)',
                    color: isActive ? 'black' : 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: isActive ? 'bold' : 'normal',
                    boxShadow: isActive ? `0 0 10px ${diceSpecificColor}` : 'none',
                    transition: 'all 0.3s ease'
                  }}
                >{dice}</button>
              );
            })}
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
              backgroundColor: rolling ? '#888888' : getDiceColor(diceType),
              color: 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: rolling ? 'default' : 'pointer',
              fontWeight: 'bold',
              boxShadow: rolling ? 'none' : `0 0 15px ${getDiceColor(diceType)}80`,
              zIndex: 20,
              opacity: rolling ? 0.7 : 1,
              transition: 'all 0.3s ease'
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
