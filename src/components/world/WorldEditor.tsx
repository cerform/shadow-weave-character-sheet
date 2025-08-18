import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect } from "react";
import StudGrid from "./StudGrid";
import BrickInstances from "./BrickInstances";
import GhostPreview from "./GhostPreview";
import Palette from "./Palette";
import Toolbar from "./Toolbar";
import { useWorldStore } from "@/stores/worldStore";

export default function WorldEditor() {
  const { rotateCW, setHeight, currentHeight, undoAction, redoAction } = useWorldStore();

  // Горячие клавиши
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Избегаем обработки если фокус на input'е
      if (e.target instanceof HTMLInputElement) return;
      
      switch (e.code) {
        case 'KeyQ':
        case 'KeyE':
          e.preventDefault();
          rotateCW();
          break;
        case 'KeyR':
          e.preventDefault();
          setHeight(currentHeight + 1);
          break;
        case 'KeyF':
          e.preventDefault();
          setHeight(Math.max(0, currentHeight - 1));
          break;
        case 'KeyZ':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (e.shiftKey) {
              redoAction();
            } else {
              undoAction();
            }
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rotateCW, setHeight, currentHeight, undoAction, redoAction]);

  return (
    <div className="w-full h-full relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Canvas 
        shadows 
        camera={{ position: [12, 15, 12], fov: 50 }}
        className="w-full h-full"
      >
        {/* Освещение */}
        <ambientLight intensity={0.4} />
        <directionalLight 
          castShadow 
          position={[10, 15, 5]} 
          intensity={0.8}
          shadow-mapSize={[2048, 2048]}
          shadow-camera-far={50}
          shadow-camera-left={-25}
          shadow-camera-right={25}
          shadow-camera-top={25}
          shadow-camera-bottom={-25}
        />
        <pointLight position={[-10, 10, -10]} intensity={0.3} />

        {/* Основная плоскость */}
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>

        {/* Компоненты мира */}
        <StudGrid />
        <BrickInstances />
        <GhostPreview />
        
        {/* Управление камерой */}
        <OrbitControls 
          enableDamping 
          dampingFactor={0.05}
          minDistance={5}
          maxDistance={50}
          maxPolarAngle={Math.PI / 2.2}
        />
      </Canvas>

      {/* UI оверлеи */}
      <Palette />
      <Toolbar />
      
      {/* Заголовок */}
      <div className="absolute top-4 left-4 z-10">
        <h1 className="text-2xl font-bold text-white drop-shadow-lg">
          Конструктор D&D
        </h1>
        <p className="text-sm text-white/70">
          LEGO-подобный строительный режим
        </p>
      </div>
    </div>
  );
}