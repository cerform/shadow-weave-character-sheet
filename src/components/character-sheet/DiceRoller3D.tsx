
import { useState, useRef, Suspense, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { useTheme } from '@/hooks/use-theme'

// Dice face textures definition for each dice type
const diceConfigs = {
  d4: { sides: 4, texture: null },
  d6: { sides: 6, texture: null },
  d8: { sides: 8, texture: null },
  d10: { sides: 10, texture: null },
  d12: { sides: 12, texture: null },
  d20: { sides: 20, texture: null },
  d100: { sides: 100, texture: null }
}

type DieType = keyof typeof diceConfigs;

// Создание улучшенной геометрии для d10 на основе изображения-примера
const createD10Geometry = () => {
  // Создаем базовую геометрию для d10, используя модифицированную пирамиду с 10 гранями
  const geometry = new THREE.BufferGeometry();
  const height = 1.2;
  
  // Генерируем вершины для d10 на основе десятиугольника
  const vertices = [];
  const topPt = new THREE.Vector3(0, height, 0);
  const botPt = new THREE.Vector3(0, -height, 0);
  
  // Основания: верхнее и нижнее
  for (let i = 0; i < 10; i++) {
    const angle = (i / 5) * Math.PI; // Угол на окружности
    // Вершина на "экваторе" - смещена чтобы создать ромбовидную форму
    const pt = new THREE.Vector3(
      Math.cos(angle) * 1.2,
      i % 2 === 0 ? 0.15 : -0.15, // Чередуем высоту для создания ромбовидности
      Math.sin(angle) * 1.2
    );
    vertices.push(pt);
  }
  
  // Индексы для треугольников
  const indices = [];
  
  // Соединяем верхнюю точку с каждой второй вершиной экватора
  for (let i = 0; i < 10; i += 2) {
    indices.push(10, i, (i + 2) % 10);
  }
  
  // Соединяем нижнюю точку с каждой нечетной вершиной экватора
  for (let i = 1; i < 10; i += 2) {
    indices.push(11, (i + 2) % 10, i);
  }
  
  // Добавляем треугольники для боковых граней
  for (let i = 0; i < 10; i++) {
    const next = (i + 1) % 10;
    if (i % 2 === 0) {
      indices.push(i, next, 10); // Верхняя грань
    } else {
      indices.push(i, 11, next); // Нижняя грань
    }
  }
  
  // Добавляем верхнюю и нижнюю точки в вершины
  vertices.push(topPt);  // Индекс 10
  vertices.push(botPt);  // Индекс 11
  
  // Преобразование массива вершин в плоский массив
  const positions = new Float32Array(vertices.length * 3);
  for (let i = 0; i < vertices.length; i++) {
    positions[i * 3] = vertices[i].x;
    positions[i * 3 + 1] = vertices[i].y;
    positions[i * 3 + 2] = vertices[i].z;
  }
  
  // Создание индексного буфера
  geometry.setIndex(indices);
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
  // Вычисляем нормали для правильного освещения
  geometry.computeVertexNormals();
  
  return geometry;
};

// Individual Die component
function Die({ type = 'd20', onRollComplete }: { type: DieType, onRollComplete: (value: number) => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState(0);
  const rotationSpeed = useRef(new THREE.Vector3(
    Math.random() * 0.2 - 0.1,
    Math.random() * 0.2 - 0.1,
    Math.random() * 0.2 - 0.1
  ));
  const { theme } = useTheme();
  
  // Функция для броска кубика
  const roll = () => {
    setRolling(true);
    rotationSpeed.current = new THREE.Vector3(
      Math.random() * 0.6 - 0.3,
      Math.random() * 0.6 - 0.3,
      Math.random() * 0.6 - 0.3
    );
    
    // Добавляем случайное начальное положение для реалистичности
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.random() * Math.PI;
      meshRef.current.rotation.y = Math.random() * Math.PI;
      meshRef.current.rotation.z = Math.random() * Math.PI;
    }
  };
  
  // Auto-roll on first render and type change
  useEffect(() => {
    // Small delay for initial rendering
    const timer = setTimeout(() => {
      roll();
    }, 300);
    return () => clearTimeout(timer);
  }, [type]); // Перебрасываем при изменении типа кубика
  
  // Animation logic
  useFrame((state) => {
    if (!meshRef.current) return;
    
    if (rolling) {
      // Active roll animation
      meshRef.current.rotation.x += rotationSpeed.current.x;
      meshRef.current.rotation.y += rotationSpeed.current.y;
      meshRef.current.rotation.z += rotationSpeed.current.z;
      
      // Имитация гравитации и трения
      rotationSpeed.current.y -= 0.001; // гравитация
      
      // Slow down rotation gradually
      rotationSpeed.current.x *= 0.97; // Slightly faster slow down
      rotationSpeed.current.y *= 0.97;
      rotationSpeed.current.z *= 0.97;
      
      // Stop rolling when slow enough
      if (
        Math.abs(rotationSpeed.current.x) < 0.002 &&
        Math.abs(rotationSpeed.current.y) < 0.002 &&
        Math.abs(rotationSpeed.current.z) < 0.002
      ) {
        setRolling(false);
        const diceResult = Math.floor(Math.random() * diceConfigs[type].sides) + 1;
        setResult(diceResult);
        onRollComplete(diceResult);
      }
    } else {
      // Gentle idle rotation when not rolling
      meshRef.current.rotation.x += 0.005;
      meshRef.current.rotation.y += 0.005;
    }
  });
  
  // Define geometry based on dice type
  const getGeometry = () => {
    switch(type) {
      case 'd4':
        return <tetrahedronGeometry args={[1.5, 0]} />;
      case 'd6':
        return <boxGeometry args={[1.5, 1.5, 1.5]} />;
      case 'd8':
        return <octahedronGeometry args={[1.2, 0]} />;
      case 'd10':
        // Используем специальную улучшенную геометрию для d10
        return <primitive object={createD10Geometry()} />;
      case 'd12':
        return <dodecahedronGeometry args={[1.2, 0]} />;
      case 'd20':
        return <icosahedronGeometry args={[1.2, 0]} />;
      case 'd100':
        // d100 визуально как d10, но с другим результатом
        return <primitive object={createD10Geometry()} />;
      default:
        return <icosahedronGeometry args={[1.2, 0]} />;
    }
  };

  // Get color based on dice type and current theme
  const getDiceColor = () => {
    switch(type) {
      case 'd4':
        return new THREE.Color("#33C3F0"); // Bright blue
      case 'd6':
        return new THREE.Color("#8B5CF6"); // Vivid purple
      case 'd8':
        return new THREE.Color("#10B981"); // Emerald green
      case 'd10':
        return new THREE.Color("#F59E0B"); // Amber
      case 'd12':
        return new THREE.Color("#EC4899"); // Pink
      case 'd20':
        // Use theme-specific color for d20
        switch(theme) {
          case 'warlock': return new THREE.Color("#8B5CF6"); // Purple
          case 'wizard': return new THREE.Color("#33C3F0"); // Blue
          case 'druid': return new THREE.Color("#10B981"); // Green
          case 'warrior': return new THREE.Color("#EA384D"); // Red
          case 'bard': return new THREE.Color("#FCD34D"); // Yellow
          default: return new THREE.Color("#8B5A2B"); // Default tavern theme
        }
      case 'd100':
        return new THREE.Color("#6366F1"); // Indigo
      default:
        return new THREE.Color("#8B5CF6"); // Vivid purple
    }
  };
  
  return (
    <mesh ref={meshRef} castShadow onClick={roll}>
      {getGeometry()}
      <meshStandardMaterial 
        color={getDiceColor()} 
        metalness={0.5} 
        roughness={0.2} 
        emissive={getDiceColor()}
        emissiveIntensity={0.4}
      />
    </mesh>
  );
}

// Scene component for the dice
function DiceScene({ diceType, onRollComplete }: { diceType: DieType, onRollComplete: (value: number) => void }) {
  const { camera } = useThree();
  
  // Set camera position on init
  useEffect(() => {
    if(camera instanceof THREE.PerspectiveCamera) {
      camera.position.z = 5;
    }
  }, [camera]);
  
  return (
    <>
      <ambientLight intensity={1.2} /> 
      <directionalLight position={[10, 10, 10]} intensity={2.0} castShadow />
      <pointLight position={[-10, -10, -10]} intensity={1.0} color="#ffffff" />
      <Die type={diceType} onRollComplete={onRollComplete} />
      <OrbitControls enablePan={false} />
    </>
  );
}

interface DiceRoller3DProps {
  initialDice?: DieType;
  onRollComplete?: (value: number) => void;
  hideControls?: boolean;
  modifier?: number;
}

export const DiceRoller3D: React.FC<DiceRoller3DProps> = ({ 
  initialDice = 'd20', 
  onRollComplete = () => {}, 
  hideControls = false,
  modifier = 0
}) => {
  const [diceCount, setDiceCount] = useState(1);
  const [activeDice, setActiveDice] = useState<DieType>(initialDice);
  const [results, setResults] = useState<{dice: DieType, value: number}[]>([]);
  const [rolling, setRolling] = useState(false);
  const [resultHistory, setResultHistory] = useState<{dice: DieType, value: number, timestamp: number}[]>([]);
  const [diceModifier, setDiceModifier] = useState(modifier);
  const [key, setKey] = useState(0); // Ключ для принудительного обновления компонента
  
  const handleRollComplete = (value: number) => {
    const newResult = { dice: activeDice, value };
    setResults(prev => [...prev, newResult]);
    
    // Add to history with timestamp
    setResultHistory(prev => [
      { ...newResult, timestamp: Date.now() },
      ...prev.slice(0, 9) // Keep only 10 most recent rolls
    ]);
    
    setRolling(false);
    
    // Call external handler if provided
    onRollComplete(value + diceModifier);
  };
  
  const rollDice = (type: DieType) => {
    setActiveDice(type);
    setRolling(true);
    
    // Clear previous results
    setResults([]);
    
    // Форсируем обновление компонента для перебрасывания
    setKey(prevKey => prevKey + 1);
  };
  
  // Calculate the total of all dice rolled
  const totalResult = results.reduce((sum, result) => sum + result.value, 0) + diceModifier;
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 mb-2 bg-black/10 rounded-lg overflow-hidden relative">
        <Canvas shadows key={key}>
          <Suspense fallback={null}>
            <DiceScene diceType={activeDice} onRollComplete={handleRollComplete} />
          </Suspense>
        </Canvas>
        
        {/* Результаты смещены ниже */}
        {(results.length > 0) && (
          <div className="absolute bottom-2 left-0 right-0 mx-auto w-max bg-primary/20 backdrop-blur-md p-3 rounded-md shadow-lg text-center">
            <div>
              <span className="font-bold text-2xl">{totalResult}</span>
              <div className="text-xs mt-0.5 opacity-90">
                {results.map((r) => r.value).join(' + ')}
                {diceModifier !== 0 && ` ${diceModifier >= 0 ? '+' : ''} ${diceModifier}`}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* История бросков - улучшенная видимость */}
      {!hideControls && resultHistory.length > 0 && (
        <div className="h-10 mb-2 overflow-x-auto flex items-center gap-2 scrollbar-none">
          {resultHistory.map((item) => (
            <div key={item.timestamp} className="px-2 py-1 text-xs bg-primary/20 rounded-md flex items-center gap-1 whitespace-nowrap border border-primary/20">
              <span className="font-medium">{item.dice}:</span>
              <span className="font-bold text-primary">{item.value + diceModifier}</span>
            </div>
          ))}
        </div>
      )}
      
      {!hideControls && (
        <>
          <div className="mb-2">
            <Tabs defaultValue={activeDice} value={activeDice} className="w-full" onValueChange={(val) => setActiveDice(val as DieType)}>
              <TabsList className="grid grid-cols-3 md:grid-cols-7 gap-1 h-auto">
                <TabsTrigger value="d4" className="text-sm py-1 px-2 text-foreground data-[state=inactive]:text-foreground/70">d4</TabsTrigger>
                <TabsTrigger value="d6" className="text-sm py-1 px-2 text-foreground data-[state=inactive]:text-foreground/70">d6</TabsTrigger>
                <TabsTrigger value="d8" className="text-sm py-1 px-2 text-foreground data-[state=inactive]:text-foreground/70">d8</TabsTrigger>
                <TabsTrigger value="d10" className="text-sm py-1 px-2 text-foreground data-[state=inactive]:text-foreground/70">d10</TabsTrigger>
                <TabsTrigger value="d12" className="text-sm py-1 px-2 text-foreground data-[state=inactive]:text-foreground/70">d12</TabsTrigger>
                <TabsTrigger value="d20" className="text-sm py-1 px-2 text-foreground data-[state=inactive]:text-foreground/70">d20</TabsTrigger>
                <TabsTrigger value="d100" className="text-sm py-1 px-2 text-foreground data-[state=inactive]:text-foreground/70">d100</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="flex gap-2">
            <Input 
              type="number" 
              value={diceCount} 
              onChange={(e) => setDiceCount(Number(e.target.value))}
              className="w-16 text-center text-foreground"
              min={1}
              max={10}
            />
            <Input 
              type="number" 
              value={diceModifier} 
              onChange={(e) => setDiceModifier(Number(e.target.value))}
              className="w-16 text-center text-foreground"
              placeholder="+/-"
            />
            <Button 
              onClick={() => rollDice(activeDice)} 
              variant="default" 
              className="flex-1"
              disabled={rolling}
            >
              {`Бросить ${diceCount}${activeDice}${diceModifier !== 0 ? (diceModifier > 0 ? '+' : '') + diceModifier : ''}`}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
