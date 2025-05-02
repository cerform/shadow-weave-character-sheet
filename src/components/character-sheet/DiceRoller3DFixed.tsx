
import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, Text, Octahedron, Icosahedron, Dodecahedron, Tetrahedron } from '@react-three/drei';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import * as THREE from 'three';

// Типы поддерживаемых кубиков
export type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';

interface DiceProps {
  diceType: DiceType;
  onRollComplete?: (result: number) => void;
  rolling: boolean;
  setRolling: (rolling: boolean) => void;
  themeColor: string;
}

interface DiceRoller3DProps {
  initialDice?: DiceType;
  onRollComplete?: (result: number) => void;
  hideControls?: boolean;
  modifier?: number;
  themeColor?: string;
  fixedPosition?: boolean; // Новый параметр для фиксации позиции
}

// Кубик D4 (тетраэдр)
const D4 = ({ rolling, setRolling, onRollComplete, themeColor }: DiceProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [rotationSpeed] = useState(() => ({
    x: Math.random() * 0.01 - 0.005,
    y: Math.random() * 0.01 - 0.005,
    z: Math.random() * 0.01 - 0.005
  }));
  const [result, setResult] = useState(1);
  
  useFrame(() => {
    if (meshRef.current) {
      if (rolling) {
        // Быстрое вращение при броске
        meshRef.current.rotation.x += rotationSpeed.x * 30;
        meshRef.current.rotation.y += rotationSpeed.y * 30;
        meshRef.current.rotation.z += rotationSpeed.z * 30;
      } else {
        // Медленное вращение в обычном состоянии
        meshRef.current.rotation.x += rotationSpeed.x;
        meshRef.current.rotation.y += rotationSpeed.y;
        meshRef.current.rotation.z += rotationSpeed.z;
      }
    }
  });
  
  useEffect(() => {
    if (rolling) {
      const newResult = Math.floor(Math.random() * 4) + 1;
      setResult(newResult);
      
      // Завершаем бросок через некоторое время
      const timer = setTimeout(() => {
        setRolling(false);
        if (onRollComplete) {
          onRollComplete(newResult);
        }
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [rolling, setRolling, onRollComplete]);
  
  // Конвертируем hex цвет в объект THREE.Color
  const color = new THREE.Color(themeColor || '#7E69AB');
  
  return (
    <Tetrahedron ref={meshRef} args={[1, 0]} position={[0, 0, 0]}>
      <meshStandardMaterial color={color} wireframe={false} roughness={0.4} metalness={0.6} />
      {Array.from({length: 4}).map((_, i) => (
        <Text
          key={i}
          position={[
            i === 0 ? 0 : i === 1 ? 0.5 : i === 2 ? -0.5 : 0,
            i === 0 ? 0.8 : i === 1 ? -0.3 : i === 2 ? -0.3 : -0.5,
            i === 0 ? 0 : i === 1 ? 0.5 : i === 2 ? -0.5 : 0
          ]}
          rotation={[0, 0, 0]}
          fontSize={0.5}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {(i + 1).toString()}
        </Text>
      ))}
    </Tetrahedron>
  );
};

// Кубик D6 (куб)
const D6 = ({ rolling, setRolling, onRollComplete, themeColor }: DiceProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [rotationSpeed] = useState(() => ({
    x: Math.random() * 0.01 - 0.005,
    y: Math.random() * 0.01 - 0.005,
    z: Math.random() * 0.01 - 0.005
  }));
  const [result, setResult] = useState(1);
  
  useFrame(() => {
    if (meshRef.current) {
      if (rolling) {
        // Быстрое вращение при броске
        meshRef.current.rotation.x += rotationSpeed.x * 30;
        meshRef.current.rotation.y += rotationSpeed.y * 30;
        meshRef.current.rotation.z += rotationSpeed.z * 30;
      } else {
        // Медленное вращение в обычном состоянии
        meshRef.current.rotation.x += rotationSpeed.x;
        meshRef.current.rotation.y += rotationSpeed.y;
        meshRef.current.rotation.z += rotationSpeed.z;
      }
    }
  });
  
  useEffect(() => {
    if (rolling) {
      const newResult = Math.floor(Math.random() * 6) + 1;
      setResult(newResult);
      
      // Завершаем бросок через некоторое время
      const timer = setTimeout(() => {
        setRolling(false);
        if (onRollComplete) {
          onRollComplete(newResult);
        }
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [rolling, setRolling, onRollComplete]);
  
  // Конвертируем hex цвет в объект THREE.Color
  const color = new THREE.Color(themeColor || '#7E69AB');
  
  return (
    <Box ref={meshRef} args={[1, 1, 1]} position={[0, 0, 0]}>
      <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
      {/* Цифры на гранях */}
      <Text position={[0, 0, 0.51]} rotation={[0, 0, 0]} fontSize={0.5} color="white" anchorX="center" anchorY="middle">
        {result.toString()}
      </Text>
      <Text position={[0, 0, -0.51]} rotation={[0, Math.PI, 0]} fontSize={0.5} color="white" anchorX="center" anchorY="middle">
        {(7 - result).toString()}
      </Text>
      <Text position={[0, 0.51, 0]} rotation={[Math.PI/2, 0, 0]} fontSize={0.5} color="white" anchorX="center" anchorY="middle">
        {((result % 3) + (result > 3 ? 3 : 0)).toString()}
      </Text>
      <Text position={[0, -0.51, 0]} rotation={[-Math.PI/2, 0, 0]} fontSize={0.5} color="white" anchorX="center" anchorY="middle">
        {(7 - ((result % 3) + (result > 3 ? 3 : 0))).toString()}
      </Text>
      <Text position={[0.51, 0, 0]} rotation={[0, Math.PI/2, 0]} fontSize={0.5} color="white" anchorX="center" anchorY="middle">
        {(((result + 1) % 3) + (result > 3 ? 3 : 0)).toString()}
      </Text>
      <Text position={[-0.51, 0, 0]} rotation={[0, -Math.PI/2, 0]} fontSize={0.5} color="white" anchorX="center" anchorY="middle">
        {(7 - (((result + 1) % 3) + (result > 3 ? 3 : 0))).toString()}
      </Text>
    </Box>
  );
};

// Кубик D8 (октаэдр)
const D8 = ({ rolling, setRolling, onRollComplete, themeColor }: DiceProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [rotationSpeed] = useState(() => ({
    x: Math.random() * 0.01 - 0.005,
    y: Math.random() * 0.01 - 0.005,
    z: Math.random() * 0.01 - 0.005
  }));
  const [result, setResult] = useState(1);
  
  useFrame(() => {
    if (meshRef.current) {
      if (rolling) {
        meshRef.current.rotation.x += rotationSpeed.x * 30;
        meshRef.current.rotation.y += rotationSpeed.y * 30;
        meshRef.current.rotation.z += rotationSpeed.z * 30;
      } else {
        meshRef.current.rotation.x += rotationSpeed.x;
        meshRef.current.rotation.y += rotationSpeed.y;
        meshRef.current.rotation.z += rotationSpeed.z;
      }
    }
  });
  
  useEffect(() => {
    if (rolling) {
      const newResult = Math.floor(Math.random() * 8) + 1;
      setResult(newResult);
      
      const timer = setTimeout(() => {
        setRolling(false);
        if (onRollComplete) {
          onRollComplete(newResult);
        }
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [rolling, setRolling, onRollComplete]);
  
  // Конвертируем hex цвет в объект THREE.Color
  const color = new THREE.Color(themeColor || '#7E69AB');
  
  return (
    <Octahedron ref={meshRef} args={[1, 0]} position={[0, 0, 0]}>
      <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
      {/* Номера на гранях */}
      {Array.from({length: 8}).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const y = Math.sin(angle) * 0.7;
        const z = Math.cos(angle) * 0.7;
        return (
          <Text
            key={i}
            position={[0, y, z]}
            rotation={[0, 0, -angle]}
            fontSize={0.4}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {(i + 1).toString()}
          </Text>
        );
      })}
    </Octahedron>
  );
};

// Кубик D10 (специальный многогранник)
const D10 = ({ rolling, setRolling, onRollComplete, themeColor }: DiceProps) => {
  // Используем Octahedron в качестве базы (упрощенно)
  const meshRef = useRef<THREE.Mesh>(null);
  const [rotationSpeed] = useState(() => ({
    x: Math.random() * 0.01 - 0.005,
    y: Math.random() * 0.01 - 0.005,
    z: Math.random() * 0.01 - 0.005
  }));
  const [result, setResult] = useState(1);
  
  useFrame(() => {
    if (meshRef.current) {
      if (rolling) {
        meshRef.current.rotation.x += rotationSpeed.x * 30;
        meshRef.current.rotation.y += rotationSpeed.y * 30;
        meshRef.current.rotation.z += rotationSpeed.z * 30;
      } else {
        meshRef.current.rotation.x += rotationSpeed.x;
        meshRef.current.rotation.y += rotationSpeed.y;
        meshRef.current.rotation.z += rotationSpeed.z;
      }
    }
  });
  
  useEffect(() => {
    if (rolling) {
      const newResult = Math.floor(Math.random() * 10) + 1;
      setResult(newResult);
      
      const timer = setTimeout(() => {
        setRolling(false);
        if (onRollComplete) {
          onRollComplete(newResult);
        }
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [rolling, setRolling, onRollComplete]);
  
  // Конвертируем hex цвет в объект THREE.Color
  const color = new THREE.Color(themeColor || '#7E69AB');
  
  // Используем модифицированный октаэдр для d10
  return (
    <Octahedron ref={meshRef} args={[1, 1]} position={[0, 0, 0]}>
      <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
      <Text position={[0, 0, 0.7]} rotation={[0, 0, 0]} fontSize={0.5} color="white" anchorX="center" anchorY="middle">
        {result.toString()}
      </Text>
    </Octahedron>
  );
};

// Кубик D12 (додекаэдр)
const D12 = ({ rolling, setRolling, onRollComplete, themeColor }: DiceProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [rotationSpeed] = useState(() => ({
    x: Math.random() * 0.01 - 0.005,
    y: Math.random() * 0.01 - 0.005,
    z: Math.random() * 0.01 - 0.005
  }));
  const [result, setResult] = useState(1);
  
  useFrame(() => {
    if (meshRef.current) {
      if (rolling) {
        meshRef.current.rotation.x += rotationSpeed.x * 30;
        meshRef.current.rotation.y += rotationSpeed.y * 30;
        meshRef.current.rotation.z += rotationSpeed.z * 30;
      } else {
        meshRef.current.rotation.x += rotationSpeed.x;
        meshRef.current.rotation.y += rotationSpeed.y;
        meshRef.current.rotation.z += rotationSpeed.z;
      }
    }
  });
  
  useEffect(() => {
    if (rolling) {
      const newResult = Math.floor(Math.random() * 12) + 1;
      setResult(newResult);
      
      const timer = setTimeout(() => {
        setRolling(false);
        if (onRollComplete) {
          onRollComplete(newResult);
        }
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [rolling, setRolling, onRollComplete]);
  
  // Конвертируем hex цвет в объект THREE.Color
  const color = new THREE.Color(themeColor || '#7E69AB');
  
  return (
    <Dodecahedron ref={meshRef} args={[1, 0]} position={[0, 0, 0]}>
      <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
      <Text position={[0, 0, 1]} rotation={[0, 0, 0]} fontSize={0.4} color="white" anchorX="center" anchorY="middle">
        {result.toString()}
      </Text>
    </Dodecahedron>
  );
};

// Кубик D20 (икосаэдр)
const D20 = ({ rolling, setRolling, onRollComplete, themeColor }: DiceProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [rotationSpeed] = useState(() => ({
    x: Math.random() * 0.01 - 0.005,
    y: Math.random() * 0.01 - 0.005,
    z: Math.random() * 0.01 - 0.005
  }));
  const [result, setResult] = useState(1);
  
  useFrame(() => {
    if (meshRef.current) {
      if (rolling) {
        meshRef.current.rotation.x += rotationSpeed.x * 30;
        meshRef.current.rotation.y += rotationSpeed.y * 30;
        meshRef.current.rotation.z += rotationSpeed.z * 30;
      } else {
        meshRef.current.rotation.x += rotationSpeed.x;
        meshRef.current.rotation.y += rotationSpeed.y;
        meshRef.current.rotation.z += rotationSpeed.z;
      }
    }
  });
  
  useEffect(() => {
    if (rolling) {
      const newResult = Math.floor(Math.random() * 20) + 1;
      setResult(newResult);
      
      const timer = setTimeout(() => {
        setRolling(false);
        if (onRollComplete) {
          onRollComplete(newResult);
        }
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [rolling, setRolling, onRollComplete]);
  
  // Конвертируем hex цвет в объект THREE.Color
  const color = new THREE.Color(themeColor || '#7E69AB');
  
  return (
    <Icosahedron ref={meshRef} args={[1, 0]} position={[0, 0, 0]}>
      <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
      <Text position={[0, 0, 1]} rotation={[0, 0, 0]} fontSize={0.5} color="white" anchorX="center" anchorY="middle">
        {result.toString()}
      </Text>
    </Icosahedron>
  );
};

export const DiceRoller3D: React.FC<DiceRoller3DProps> = ({
  initialDice = 'd20',
  onRollComplete,
  hideControls = false,
  modifier = 0,
  themeColor,
  fixedPosition = false
}) => {
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  const [diceType, setDiceType] = useState<DiceType>(initialDice);
  const [rolling, setRolling] = useState(false);
  const finalThemeColor = themeColor || currentTheme.accent;
  
  // Обрабатываем результат броска с учетом модификатора
  const handleRollResult = (result: number) => {
    if (onRollComplete) {
      onRollComplete(result);
    }
  };
  
  // Центрирование камеры для фиксированного положения
  const cameraPosition = fixedPosition ? [0, 0, 5] : [2, 1, 5];
  
  return (
    <div className="dice-container w-full h-full">
      <Canvas camera={{ position: cameraPosition, fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        {diceType === 'd4' && <D4 diceType={diceType} rolling={rolling} setRolling={setRolling} onRollComplete={handleRollResult} themeColor={finalThemeColor} />}
        {diceType === 'd6' && <D6 diceType={diceType} rolling={rolling} setRolling={setRolling} onRollComplete={handleRollResult} themeColor={finalThemeColor} />}
        {diceType === 'd8' && <D8 diceType={diceType} rolling={rolling} setRolling={setRolling} onRollComplete={handleRollResult} themeColor={finalThemeColor} />}
        {diceType === 'd10' && <D10 diceType={diceType} rolling={rolling} setRolling={setRolling} onRollComplete={handleRollResult} themeColor={finalThemeColor} />}
        {diceType === 'd12' && <D12 diceType={diceType} rolling={rolling} setRolling={setRolling} onRollComplete={handleRollResult} themeColor={finalThemeColor} />}
        {diceType === 'd20' && <D20 diceType={diceType} rolling={rolling} setRolling={setRolling} onRollComplete={handleRollResult} themeColor={finalThemeColor} />}
      </Canvas>
      
      {!hideControls && (
        <div className="absolute bottom-0 left-0 right-0 p-2 flex justify-center">
          <div className="flex space-x-2">
            <button onClick={() => { setDiceType('d4'); setRolling(true); }} className="px-2 py-1 bg-primary text-primary-foreground rounded">D4</button>
            <button onClick={() => { setDiceType('d6'); setRolling(true); }} className="px-2 py-1 bg-primary text-primary-foreground rounded">D6</button>
            <button onClick={() => { setDiceType('d8'); setRolling(true); }} className="px-2 py-1 bg-primary text-primary-foreground rounded">D8</button>
            <button onClick={() => { setDiceType('d10'); setRolling(true); }} className="px-2 py-1 bg-primary text-primary-foreground rounded">D10</button>
            <button onClick={() => { setDiceType('d12'); setRolling(true); }} className="px-2 py-1 bg-primary text-primary-foreground rounded">D12</button>
            <button onClick={() => { setDiceType('d20'); setRolling(true); }} className="px-2 py-1 bg-primary text-primary-foreground rounded">D20</button>
          </div>
        </div>
      )}
      
      <div className="absolute top-0 left-0 right-0 p-2 flex justify-center">
        {!rolling && (
          <button 
            onClick={() => setRolling(true)} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/80"
          >
            Бросить {diceType}
          </button>
        )}
      </div>
    </div>
  );
};
