
import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Mesh, Vector3, BoxGeometry, ConeGeometry, DodecahedronGeometry, IcosahedronGeometry, OctahedronGeometry, TetrahedronGeometry, MeshStandardMaterial, DoubleSide } from 'three';
import { OrbitControls, Text } from '@react-three/drei';

// Кастомная геометрия для d10 (Pentagonal trapezohedron)
const createD10Geometry = () => {
  // Создаем геометрию для пятиугольной трапецоэдры (Pentagonal trapezohedron)
  const vertices = [];
  const indices = [];
  
  // Верхняя вершина
  vertices.push(0, 1, 0);
  
  // Верхний пентагон
  for (let i = 0; i < 5; i++) {
    const angle = (Math.PI * 2 / 5) * i;
    vertices.push(
      0.6 * Math.cos(angle),
      0.2,
      0.6 * Math.sin(angle)
    );
  }
  
  // Нижний пентагон (повернутый на 36 градусов)
  for (let i = 0; i < 5; i++) {
    const angle = (Math.PI * 2 / 5) * (i + 0.5);
    vertices.push(
      0.6 * Math.cos(angle),
      -0.2,
      0.6 * Math.sin(angle)
    );
  }
  
  // Нижняя вершина
  vertices.push(0, -1, 0);
  
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
  
  const geometry = new BoxGeometry(1, 1, 1);
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  
  return geometry;
};

const Dice = ({ type, onRoll, modifier = 0, autoRoll = false, hideControls = false, forceReroll = false }: { 
  type: 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100',
  onRoll?: (result: number) => void,
  modifier?: number,
  autoRoll?: boolean,
  hideControls?: boolean,
  forceReroll?: boolean
}) => {
  const meshRef = useRef<Mesh>(null!);
  const initialPositionRef = useRef<Vector3>(new Vector3(0, 3, 0));
  const targetPositionRef = useRef<Vector3>(new Vector3(0, 0, 0));
  const throwForceRef = useRef<Vector3>(new Vector3(
    (Math.random() - 0.5) * 10,
    0,
    (Math.random() - 0.5) * 10
  ));
  
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState(0);
  const [readyToRoll, setReadyToRoll] = useState(true);
  const [rollPhase, setRollPhase] = useState(0); // 0: initial, 1: rolling, 2: settled
  
  // Определение геометрии и числа граней для кубика
  const getDiceGeometry = (type: string) => {
    switch (type) {
      case 'd4':
        return new TetrahedronGeometry(1, 0);
      case 'd6':
        return new BoxGeometry(1, 1, 1);
      case 'd8':
        return new OctahedronGeometry(1, 0);
      case 'd10':
        return createD10Geometry();
      case 'd12':
        return new DodecahedronGeometry(1, 0);
      case 'd20':
        return new IcosahedronGeometry(1, 0);
      case 'd100':
        // Для d100 используем также геометрию d10, но с другой логикой результата
        return createD10Geometry();
      default:
        return new BoxGeometry(1, 1, 1);
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
      throwForceRef.current = new Vector3(
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
    }
  });
  
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 2, 5);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  
  return (
    <group>
      <mesh ref={meshRef} position={initialPositionRef.current} castShadow receiveShadow>
        <primitive object={getDiceGeometry(type)} />
        <meshStandardMaterial color="#ffffff" metalness={0.5} roughness={0.5} />
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
      
      {result > 0 && !rolling && (
        <group position={[0, 1.5, 0]}>
          <Text position={[0, 0, 0]} fontSize={0.5} color="#FFD700">
            {result + (modifier !== 0 ? ` (${modifier > 0 ? '+' + modifier : modifier}) = ${result + modifier}` : '')}
          </Text>
        </group>
      )}
    </group>
  );
};

export const DiceRoller3D = ({ initialDice = 'd20', hideControls = false, modifier = 0, onRollComplete }: {
  initialDice?: 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100',
  hideControls?: boolean,
  modifier?: number,
  onRollComplete?: (result: number) => void
}) => {
  const [diceType, setDiceType] = useState<'d4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100'>(initialDice);
  const [roll, setRoll] = useState(false);
  const [forceReroll, setForceReroll] = useState(false);
  
  const handleDiceChange = (type: 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100') => {
    setDiceType(type);
  };
  
  const handleRoll = () => {
    setRoll(true);
    setForceReroll(prev => !prev); // Переключаем, чтобы вызвать эффект перебрасывания
  };
  
  const handleRollComplete = (result: number) => {
    setRoll(false);
    if (onRollComplete) {
      onRollComplete(result);
    }
  };
  
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas shadows>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} castShadow />
        <Dice 
          type={diceType} 
          onRoll={handleRollComplete}
          modifier={modifier}
          autoRoll={roll}
          hideControls={hideControls}
          forceReroll={forceReroll}
        />
        <OrbitControls enablePan={false} enableZoom={false} />
      </Canvas>
      
      {!hideControls && (
        <div style={{ position: 'absolute', bottom: 10, left: 0, width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}>
          <button onClick={() => handleDiceChange('d4')} style={{ padding: '4px 8px', opacity: diceType === 'd4' ? 1 : 0.6 }}>d4</button>
          <button onClick={() => handleDiceChange('d6')} style={{ padding: '4px 8px', opacity: diceType === 'd6' ? 1 : 0.6 }}>d6</button>
          <button onClick={() => handleDiceChange('d8')} style={{ padding: '4px 8px', opacity: diceType === 'd8' ? 1 : 0.6 }}>d8</button>
          <button onClick={() => handleDiceChange('d10')} style={{ padding: '4px 8px', opacity: diceType === 'd10' ? 1 : 0.6 }}>d10</button>
          <button onClick={() => handleDiceChange('d12')} style={{ padding: '4px 8px', opacity: diceType === 'd12' ? 1 : 0.6 }}>d12</button>
          <button onClick={() => handleDiceChange('d20')} style={{ padding: '4px 8px', opacity: diceType === 'd20' ? 1 : 0.6 }}>d20</button>
          <button onClick={() => handleDiceChange('d100')} style={{ padding: '4px 8px', opacity: diceType === 'd100' ? 1 : 0.6 }}>d100</button>
        </div>
      )}
      
      {!hideControls && (
        <button 
          onClick={handleRoll}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            padding: '8px 16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Бросить {diceType}
        </button>
      )}
    </div>
  );
};
