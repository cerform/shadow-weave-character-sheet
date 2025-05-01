
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
}

type DieType = keyof typeof diceConfigs;

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
  
  // Auto-roll on first render
  useEffect(() => {
    // Small delay for initial rendering
    const timer = setTimeout(() => {
      roll();
    }, 300);
    return () => clearTimeout(timer);
  }, []);
  
  // Animation logic
  useFrame((state) => {
    if (!meshRef.current) return;
    
    if (rolling) {
      // Active roll animation
      meshRef.current.rotation.x += rotationSpeed.current.x;
      meshRef.current.rotation.y += rotationSpeed.current.y;
      meshRef.current.rotation.z += rotationSpeed.current.z;
      
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
        // Simplified as cylinder for now
        return <cylinderGeometry args={[1, 1, 1.5, 10]} />;
      case 'd12':
        return <dodecahedronGeometry args={[1.2, 0]} />;
      case 'd20':
        return <icosahedronGeometry args={[1.2, 0]} />;
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
          default: return new THREE.Color("#8B5CF6"); // Default purple
        }
      default:
        return new THREE.Color("#8B5CF6"); // Vivid purple
    }
  };
  
  // Roll the die with random force
  const roll = () => {
    setRolling(true);
    rotationSpeed.current = new THREE.Vector3(
      Math.random() * 0.3 - 0.15,
      Math.random() * 0.3 - 0.15,
      Math.random() * 0.3 - 0.15
    );
  };
  
  return (
    <mesh ref={meshRef} castShadow onClick={roll}>
      {getGeometry()}
      <meshStandardMaterial 
        color={getDiceColor()} 
        metalness={0.2} // Reduced metalness for better visibility
        roughness={0.1} // Smoother for better light reflection
        emissive={getDiceColor()}
        emissiveIntensity={0.4} // Increased glow for better visibility
      />
    </mesh>
  );
}

// Scene component for the dice
function DiceScene({ diceType, onRollComplete }: { diceType: DieType, onRollComplete: (value: number) => void }) {
  const { camera } = useThree();
  
  // Set camera position on init
  if(camera instanceof THREE.PerspectiveCamera) {
    camera.position.z = 5;
  }
  
  return (
    <>
      <ambientLight intensity={1.2} /> {/* Increased ambient light */}
      <directionalLight position={[10, 10, 10]} intensity={2.0} castShadow /> {/* Increased intensity */}
      <pointLight position={[-10, -10, -10]} intensity={1.0} color="#ffffff" /> {/* Brighter point light */}
      <Die type={diceType} onRollComplete={onRollComplete} />
      <OrbitControls enablePan={false} />
    </>
  );
}

interface DiceRoller3DProps {
  initialDice?: DieType;
  onRollComplete?: (value: number) => void;
  hideControls?: boolean;
}

export const DiceRoller3D: React.FC<DiceRoller3DProps> = ({ 
  initialDice = 'd20', 
  onRollComplete = () => {}, 
  hideControls = false 
}) => {
  const [diceCount, setDiceCount] = useState(1);
  const [activeDice, setActiveDice] = useState<DieType>(initialDice);
  const [results, setResults] = useState<{dice: DieType, value: number}[]>([]);
  const [rolling, setRolling] = useState(false);
  const [resultHistory, setResultHistory] = useState<{dice: DieType, value: number, timestamp: number}[]>([]);
  
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
    onRollComplete(value);
  };
  
  const rollDice = (type: DieType) => {
    setActiveDice(type);
    setRolling(true);
    
    // Clear previous results
    setResults([]);
  };
  
  // Calculate the total of all dice rolled
  const totalResult = results.reduce((sum, result) => sum + result.value, 0);
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 mb-2 bg-black/10 rounded-lg overflow-hidden relative">
        <Canvas shadows>
          <Suspense fallback={null}>
            <DiceScene diceType={activeDice} onRollComplete={handleRollComplete} />
          </Suspense>
        </Canvas>
        
        {/* Results display - moved below the dice */}
        {(results.length > 0) && (
          <div className="absolute bottom-4 left-0 right-0 mx-auto w-max bg-primary/20 backdrop-blur-md p-3 rounded-md shadow-lg text-center">
            <div>
              <span className="font-bold text-2xl">{totalResult}</span>
              {results.length > 1 && (
                <div className="text-xs mt-0.5 opacity-90">
                  {results.map((r, i) => r.value).join(' + ')}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* History display - improved visibility */}
      {!hideControls && resultHistory.length > 0 && (
        <div className="h-10 mb-2 overflow-x-auto flex items-center gap-2 scrollbar-none">
          {resultHistory.map((item, index) => (
            <div key={item.timestamp} className="px-2 py-1 text-xs bg-primary/20 rounded-md flex items-center gap-1 whitespace-nowrap border border-primary/20">
              <span className="font-medium">{item.dice}:</span>
              <span className="font-bold text-primary">{item.value}</span>
            </div>
          ))}
        </div>
      )}
      
      {!hideControls && (
        <>
          <div className="mb-2">
            <Tabs defaultValue={activeDice} value={activeDice} className="w-full" onValueChange={(val) => rollDice(val as DieType)}>
              <TabsList className="grid grid-cols-3 md:grid-cols-6 gap-1 h-auto">
                <TabsTrigger value="d4" className="text-sm py-1 px-2">d4</TabsTrigger>
                <TabsTrigger value="d6" className="text-sm py-1 px-2">d6</TabsTrigger>
                <TabsTrigger value="d8" className="text-sm py-1 px-2">d8</TabsTrigger>
                <TabsTrigger value="d10" className="text-sm py-1 px-2">d10</TabsTrigger>
                <TabsTrigger value="d12" className="text-sm py-1 px-2">d12</TabsTrigger>
                <TabsTrigger value="d20" className="text-sm py-1 px-2">d20</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="flex gap-2">
            <Input 
              type="number" 
              value={diceCount} 
              onChange={(e) => setDiceCount(Number(e.target.value))}
              className="w-20 text-center"
              min={1}
              max={10}
            />
            <Button 
              onClick={() => rollDice(activeDice)} 
              variant="default" 
              className="flex-1"
              disabled={rolling}
            >
              {`Бросить ${diceCount}d${activeDice.substring(1)}`}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
