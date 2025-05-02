
import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Mesh, Vector3, BoxGeometry, ConeGeometry, DodecahedronGeometry, IcosahedronGeometry, OctahedronGeometry, TetrahedronGeometry, MeshStandardMaterial, DoubleSide, BufferGeometry, BufferAttribute, Color } from 'three';
import { OrbitControls, Text3D, Center } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

// Создаем специальную геометрию для d4 с числами на гранях
const createD4WithNumbers = () => {
  const geometry = new TetrahedronGeometry(1.2, 0);
  return geometry;
};

// Создаем специальную геометрию для d6 с числами на гранях
const createD6WithNumbers = () => {
  const geometry = new BoxGeometry(1, 1, 1);
  return geometry;
};

// Создаем специальную геометрию для d8
const createD8WithNumbers = () => {
  const geometry = new OctahedronGeometry(1.1, 0);
  return geometry;
};

// Кастомная геометрия для d10
const createD10Geometry = () => {
  // Создаем геометрию для пятиугольной трапецоэдры
  const vertices = [];
  const indices = [];
  
  // Верхняя вершина
  vertices.push(0, 1.2, 0);
  
  // Верхний пентагон
  for (let i = 0; i < 5; i++) {
    const angle = (Math.PI * 2 / 5) * i;
    vertices.push(
      0.7 * Math.cos(angle),
      0.3,
      0.7 * Math.sin(angle)
    );
  }
  
  // Нижний пентагон (повернутый на 36 градусов)
  for (let i = 0; i < 5; i++) {
    const angle = (Math.PI * 2 / 5) * (i + 0.5);
    vertices.push(
      0.7 * Math.cos(angle),
      -0.3,
      0.7 * Math.sin(angle)
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
  
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  
  return geometry;
};

// Создаем модель d12
const createD12WithNumbers = () => {
  const geometry = new DodecahedronGeometry(0.9, 0);
  return geometry;
};

// Создаем модель d20
const createD20WithNumbers = () => {
  const geometry = new IcosahedronGeometry(1, 0);
  return geometry;
};

// Компонент для отображения чисел на гранях кубиков
const DiceNumbers = ({ type, position, visible }: { 
  type: 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20', 
  position: Vector3,
  visible: boolean 
}) => {
  if (!visible) return null;
  
  // Для разных типов кубиков разные конфигурации чисел
  switch (type) {
    case 'd4':
      return (
        <group position={position}>
          <Text3D 
            position={[0, 0.7, 0]} 
            size={0.3}
            height={0.05}
            curveSegments={4}
            bevelEnabled={false}
            rotation={[0, Math.PI / 4, 0]}
            font="/fonts/helvetiker_bold.typeface.json"
          >
            4
            <meshStandardMaterial color="#ffffff" />
          </Text3D>
          <Text3D 
            position={[0.5, -0.2, 0.5]} 
            size={0.3}
            height={0.05}
            curveSegments={4}
            bevelEnabled={false}
            rotation={[Math.PI/6, Math.PI/4, 0]}
            font="/fonts/helvetiker_bold.typeface.json"
          >
            1
            <meshStandardMaterial color="#ffffff" />
          </Text3D>
          <Text3D 
            position={[-0.5, -0.2, 0.5]} 
            size={0.3}
            height={0.05}
            curveSegments={4}
            bevelEnabled={false}
            rotation={[Math.PI/6, -Math.PI/4, 0]}
            font="/fonts/helvetiker_bold.typeface.json"
          >
            2
            <meshStandardMaterial color="#ffffff" />
          </Text3D>
          <Text3D 
            position={[0, -0.2, -0.7]} 
            size={0.3}
            height={0.05}
            curveSegments={4}
            bevelEnabled={false}
            rotation={[Math.PI/6, Math.PI, 0]}
            font="/fonts/helvetiker_bold.typeface.json"
          >
            3
            <meshStandardMaterial color="#ffffff" />
          </Text3D>
        </group>
      );
    case 'd6':
      return (
        <group position={position}>
          {/* Цифры на гранях d6 */}
          <Text3D 
            position={[0, 0, 0.51]} 
            size={0.4}
            height={0.05}
            curveSegments={4}
            bevelEnabled={false}
            font="/fonts/helvetiker_bold.typeface.json"
          >
            1
            <meshStandardMaterial color="#ffffff" />
          </Text3D>
          <Text3D 
            position={[0.51, 0, 0]} 
            size={0.4}
            height={0.05}
            curveSegments={4}
            bevelEnabled={false}
            rotation={[0, Math.PI/2, 0]}
            font="/fonts/helvetiker_bold.typeface.json"
          >
            2
            <meshStandardMaterial color="#ffffff" />
          </Text3D>
          <Text3D 
            position={[0, 0.51, 0]} 
            size={0.4}
            height={0.05}
            curveSegments={4}
            bevelEnabled={false}
            rotation={[-Math.PI/2, 0, 0]}
            font="/fonts/helvetiker_bold.typeface.json"
          >
            3
            <meshStandardMaterial color="#ffffff" />
          </Text3D>
          <Text3D 
            position={[0, -0.51, 0]} 
            size={0.4}
            height={0.05}
            curveSegments={4}
            bevelEnabled={false}
            rotation={[Math.PI/2, 0, 0]}
            font="/fonts/helvetiker_bold.typeface.json"
          >
            4
            <meshStandardMaterial color="#ffffff" />
          </Text3D>
          <Text3D 
            position={[-0.51, 0, 0]} 
            size={0.4}
            height={0.05}
            curveSegments={4}
            bevelEnabled={false}
            rotation={[0, -Math.PI/2, 0]}
            font="/fonts/helvetiker_bold.typeface.json"
          >
            5
            <meshStandardMaterial color="#ffffff" />
          </Text3D>
          <Text3D 
            position={[0, 0, -0.51]} 
            size={0.4}
            height={0.05}
            curveSegments={4}
            bevelEnabled={false}
            rotation={[0, Math.PI, 0]}
            font="/fonts/helvetiker_bold.typeface.json"
          >
            6
            <meshStandardMaterial color="#ffffff" />
          </Text3D>
        </group>
      );
    case 'd20':
      return (
        <group position={position}>
          <Text3D 
            position={[0, 0, 1.1]} 
            size={0.35}
            height={0.05}
            curveSegments={4}
            bevelEnabled={false}
            font="/fonts/helvetiker_bold.typeface.json"
          >
            20
            <meshStandardMaterial color="#ffffff" />
          </Text3D>
          <Text3D 
            position={[0, 0, -1.1]} 
            size={0.35}
            height={0.05}
            curveSegments={4}
            bevelEnabled={false}
            rotation={[0, Math.PI, 0]}
            font="/fonts/helvetiker_bold.typeface.json"
          >
            1
            <meshStandardMaterial color="#ffffff" />
          </Text3D>
        </group>
      );
    default:
      return null;
  }
};

const Dice = ({ type, onRoll, modifier = 0, autoRoll = false, hideControls = false, forceReroll = false, themeColor = '#ffffff' }: { 
  type: 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100',
  onRoll?: (result: number) => void,
  modifier?: number,
  autoRoll?: boolean,
  hideControls?: boolean,
  forceReroll?: boolean,
  themeColor?: string
}) => {
  const meshRef = useRef<Mesh>(null!);
  const initialPositionRef = useRef<Vector3>(new Vector3(0, 0, 0));
  const targetPositionRef = useRef<Vector3>(new Vector3(0, 0, 0));
  const throwForceRef = useRef<Vector3>(new Vector3(
    (Math.random() - 0.5) * 10,
    (Math.random() - 0.5) * 10, 
    (Math.random() - 0.5) * 10
  ));
  
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState(0);
  const [readyToRoll, setReadyToRoll] = useState(true);
  const [rollPhase, setRollPhase] = useState(0); // 0: initial, 1: rolling, 2: settled
  const [showNumbers, setShowNumbers] = useState(false);
  
  // Преобразование HEX цвета в объект Color из Three.js
  const diceColor = new Color(themeColor);
  
  // Определение геометрии и числа граней для кубика
  const getDiceGeometry = (type: string) => {
    switch (type) {
      case 'd4':
        return createD4WithNumbers();
      case 'd6':
        return createD6WithNumbers();
      case 'd8':
        return createD8WithNumbers();
      case 'd10':
        return createD10Geometry();
      case 'd12':
        return createD12WithNumbers();
      case 'd20':
        return createD20WithNumbers();
      case 'd100':
        // Для d100 используем также геометрию d10, но с другой логикой результата
        return createD10Geometry();
      default:
        return createD6WithNumbers();
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
    setShowNumbers(false);
    
    // Генерация силы броска
    throwForceRef.current = new Vector3(
      (Math.random() - 0.5) * 15,
      (Math.random() - 0.5) * 15,
      (Math.random() - 0.5) * 15
    );
    
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
      setShowNumbers(true);
      
      if (onRoll) {
        onRoll(newResult);
      }
      
      // Позволяем бросить кубик снова через небольшую задержку
      setTimeout(() => {
        setRolling(false);
        setReadyToRoll(true);
        setRollPhase(0);
      }, 500);
    }, 1500);
  };
  
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    
    if (rolling && rollPhase === 1) {
      // Когда кубик катится, добавляем естественное вращение
      meshRef.current.rotation.x += throwForceRef.current.x * delta;
      meshRef.current.rotation.y += throwForceRef.current.y * delta;
      meshRef.current.rotation.z += throwForceRef.current.z * delta;
      
      // Постепенно замедляем
      throwForceRef.current.x *= 0.98;
      throwForceRef.current.y *= 0.98;
      throwForceRef.current.z *= 0.98;
    } else if (rollPhase === 2) {
      // Замедляем вращение когда кубик "остановился"
      meshRef.current.rotation.x *= 0.95;
      meshRef.current.rotation.y *= 0.95;
      meshRef.current.rotation.z *= 0.95;
    } else {
      // Лёгкое вращение в режиме ожидания
      meshRef.current.rotation.y += 0.005;
      meshRef.current.rotation.x += 0.001;
    }
  });
  
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  
  // Создаем материал с цветом темы и улучшенными настройками
  const diceMaterial = new MeshStandardMaterial({
    color: diceColor,
    metalness: 0.3,
    roughness: 0.4,
    emissive: new Color(diceColor).multiplyScalar(0.2),
  });
  
  return (
    <group>
      <Center>
        <mesh 
          ref={meshRef} 
          position={initialPositionRef.current} 
          castShadow 
          receiveShadow
          onClick={rollDice}
        >
          <primitive object={getDiceGeometry(type)} />
          <primitive object={diceMaterial} attach="material" />
        </mesh>
        
        {/* Отображаем числа на кубике */}
        <DiceNumbers 
          type={type as 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20'} 
          position={meshRef.current?.position || new Vector3(0, 0, 0)} 
          visible={showNumbers && !rolling && type !== 'd100' && type !== 'd10'}
        />
      </Center>
      
      {result > 0 && !rolling && (
        <group position={[0, 2, 0]}>
          <Center>
            <Text3D 
              font="/fonts/helvetiker_bold.typeface.json"
              size={0.7}
              height={0.1}
              curveSegments={12}
              bevelEnabled={false}
              color={themeColor}
            >
              {result.toString()}
              <meshStandardMaterial color={themeColor} emissive={themeColor} emissiveIntensity={0.6} />
            </Text3D>
          </Center>
        </group>
      )}
      
      {!hideControls && (
        <group position={[0, -2.5, 0]}>
          <mesh 
            position={[0, 0, 0]} 
            onClick={rollDice} 
            onPointerOver={() => document.body.style.cursor = 'pointer'} 
            onPointerOut={() => document.body.style.cursor = 'default'}
          >
            <boxGeometry args={[2.5, 0.5, 1]} />
            <meshStandardMaterial color={readyToRoll ? themeColor : "#9E9E9E"} />
          </mesh>
          <Text3D
            position={[-0.8, 0, 0.6]} 
            font="/fonts/helvetiker_bold.typeface.json"
            size={0.3}
            height={0.05}
            curveSegments={4}
            bevelEnabled={false}
          >
            {readyToRoll ? "Бросить кубик" : "..."}
            <meshStandardMaterial color="#FFFFFF" />
          </Text3D>
        </group>
      )}
    </group>
  );
};

export const DiceRoller3D = ({ 
  initialDice = 'd20', 
  hideControls = false, 
  modifier = 0, 
  onRollComplete,
  themeColor = '#ffffff',
  fixedPosition = false
}: {
  initialDice?: 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100',
  hideControls?: boolean,
  modifier?: number,
  onRollComplete?: (result: number) => void,
  themeColor?: string,
  fixedPosition?: boolean
}) => {
  const [diceType, setDiceType] = useState<'d4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100'>(initialDice);
  const [roll, setRoll] = useState(false);
  const [forceReroll, setForceReroll] = useState(false);
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  const actualThemeColor = themeColor || currentTheme.accent;
  
  const handleDiceChange = (type: 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100') => {
    setDiceType(type);
    setForceReroll(prev => !prev); // Reset the dice when changing type
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
  
  // Кнопка броска внизу для лучшей доступности
  const buttonBottom = hideControls ? "10px" : "55px";
  
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas 
        shadows 
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <Dice 
          type={diceType} 
          onRoll={handleRollComplete}
          modifier={modifier}
          autoRoll={roll}
          hideControls={hideControls}
          forceReroll={forceReroll}
          themeColor={actualThemeColor}
        />
        
        <OrbitControls 
          enablePan={false} 
          enableZoom={false} 
          enableRotate={!fixedPosition}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI - Math.PI / 6}
        />
      </Canvas>
      
      {!hideControls && (
        <div style={{ 
          position: 'absolute', 
          bottom: buttonBottom, 
          left: 0, 
          width: '100%', 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '8px',
          background: 'rgba(0,0,0,0.5)',
          padding: '8px',
          borderRadius: '8px',
        }}>
          {['d4', 'd6', 'd8', 'd10', 'd12', 'd20'].map((dice) => (
            <button 
              key={dice}
              onClick={() => handleDiceChange(dice as any)} 
              style={{ 
                padding: '6px 10px', 
                opacity: diceType === dice ? 1 : 0.6,
                backgroundColor: diceType === dice ? actualThemeColor : 'rgba(255,255,255,0.1)',
                color: diceType === dice ? 'black' : 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: diceType === dice ? 'bold' : 'normal',
                boxShadow: diceType === dice ? `0 0 10px ${actualThemeColor}` : 'none'
              }}
            >{dice}</button>
          ))}
        </div>
      )}
      
      {!hideControls && (
        <button 
          onClick={handleRoll}
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '10px 20px',
            backgroundColor: actualThemeColor,
            color: 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: `0 0 15px ${actualThemeColor}80`
          }}
        >
          Бросить {diceType}
        </button>
      )}
    </div>
  );
};
