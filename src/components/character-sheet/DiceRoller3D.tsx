
import { useState, useRef, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"

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
  const [initialRoll, setInitialRoll] = useState(true);
  
  // Animation logic
  useFrame((state) => {
    if (!meshRef.current) return;
    
    if (initialRoll) {
      // Initial gentle rotation
      meshRef.current.rotation.x += 0.005;
      meshRef.current.rotation.y += 0.005;
      return;
    }
    
    if (rolling) {
      // Active roll animation
      meshRef.current.rotation.x += rotationSpeed.current.x;
      meshRef.current.rotation.y += rotationSpeed.current.y;
      meshRef.current.rotation.z += rotationSpeed.current.z;
      
      // Slow down rotation gradually
      rotationSpeed.current.x *= 0.98;
      rotationSpeed.current.y *= 0.98;
      rotationSpeed.current.z *= 0.98;
      
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
  
  // Roll the die with random force
  const roll = () => {
    setInitialRoll(false);
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
        color={type === 'd20' ? new THREE.Color("#7f00ff") : new THREE.Color("#6c5ce7")} 
        metalness={0.8}
        roughness={0.2}
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
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1} castShadow />
      <Die type={diceType} onRollComplete={onRollComplete} />
      <OrbitControls enablePan={false} />
    </>
  );
}

export const DiceRoller3D = () => {
  const [diceCount, setDiceCount] = useState(1);
  const [activeDice, setActiveDice] = useState<DieType>('d20');
  const [results, setResults] = useState<{dice: DieType, value: number}[]>([]);
  const [rolling, setRolling] = useState(false);
  
  const handleRollComplete = (value: number) => {
    setResults(prev => [...prev, { dice: activeDice, value }]);
    setRolling(false);
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
      <div className="flex-1 mb-3 bg-black/20 rounded-lg overflow-hidden relative">
        <Canvas shadows>
          <Suspense fallback={null}>
            <DiceScene diceType={activeDice} onRollComplete={handleRollComplete} />
          </Suspense>
        </Canvas>
        
        {/* Overlay with results when finished rolling */}
        {results.length > 0 && !rolling && (
          <div className="absolute bottom-2 right-2 bg-primary/20 backdrop-blur-sm p-2 rounded-md">
            <span className="font-bold text-lg">{totalResult}</span>
          </div>
        )}
      </div>
      
      <div className="mb-2">
        <Tabs defaultValue="d20" className="w-full" onValueChange={(val) => rollDice(val as DieType)}>
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
        >
          Бросить {diceCount}d{activeDice.substring(1)}
        </Button>
      </div>
    </div>
  );
};
