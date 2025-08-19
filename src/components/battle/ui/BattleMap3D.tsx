import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useMemo, useRef, useEffect } from "react";
import { useBattleUIStore } from "@/stores/battleUIStore";
import BattleToken3D from "./BattleToken3D";
import { useBattle3DControls } from "@/hooks/useBattle3DControls";
import { useBattle3DControlStore } from "@/stores/battle3DControlStore";
import { SyncedFogOverlay3D } from "../SyncedFogOverlay3D";
import { useFogGridStore } from "@/stores/fogGridStore";

interface BattleMap3DProps {
  sessionId?: string;
  mapId?: string;
}

export default function BattleMap3D({ 
  sessionId = 'default-session', 
  mapId = 'default-map' 
}: BattleMap3DProps = {}) {
  const tokens = useBattleUIStore((s) => s.tokens);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { shouldHandleCameraControls } = useBattle3DControlStore();
  const setMapSize = useFogGridStore(s => s.setMapSize);
  const setSources = useFogGridStore(s => s.setSources);

  // Initialize fog grid size for 3D map
  useEffect(() => {
    console.log('🌫️ Initializing fog grid for 3D map');
    // 3D map logical size: 1200x800 px (corresponds to 24x16 world units)
    setMapSize({ width: 1200, height: 800 }, 40);
  }, [setMapSize]);

  // Create vision sources from tokens
  useEffect(() => {
    if (tokens.length > 0) {
      const sources = tokens.map(token => ({
        x: ((token.position[0] || 0) / 24) * 1200 + 600, // Convert 3D world coords to 2D pixel coords, center at 600px
        y: ((token.position[2] || 0) / 16) * 800 + 400,  // z in 3D becomes y in 2D, center at 400px 
        radius: 150, // Vision radius in pixels
        angle: 0,
        fov: Math.PI * 2 // 360 degree vision
      }));
      
      console.log('🌫️ Setting vision sources from tokens:', sources);
      setSources(sources);
    } else {
      console.log('🌫️ No tokens found, clearing vision sources');
      setSources([]);
    }
  }, [tokens, setSources]);

  // Инициализируем систему управления
  useBattle3DControls({ 
    canvasElement: canvasRef.current || undefined, 
    isDM: true 
  });

  const lighting = useMemo(() => ({
    ambient: { intensity: 0.6 },
    directional: { position: [10, 15, 5], intensity: 1 }
  }), []);

  return (
    <div className="w-full h-full relative bg-background rounded-xl overflow-hidden border border-border">
      <Canvas 
        ref={canvasRef}
        shadows 
        camera={{ position: [0, 20, 20], fov: 45 }}
        gl={{ antialias: true }}
        onCreated={({ gl }) => {
          // Устанавливаем ссылку на канвас для системы управления
          canvasRef.current = gl.domElement;
        }}
      >
        {/* Освещение */}
        <ambientLight intensity={lighting.ambient.intensity} />
        <directionalLight 
          castShadow 
          position={[10, 15, 5]} 
          intensity={lighting.directional.intensity}
          shadow-mapSize={[2048, 2048]}
          shadow-camera-far={50}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
        />

        {/* Основание карты с текстурой */}
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
          <planeGeometry args={[24, 16]} />
          <meshStandardMaterial 
            color="#2a2a3e" 
            transparent 
            opacity={0.8}
          />
        </mesh>

        {/* Сетка поля */}
        <gridHelper args={[24, 24, "hsl(var(--primary))", "hsl(var(--muted))"]} />

        {/* Токены */}
        {tokens.map((token) => (
          <BattleToken3D key={token.id} token={token} />
        ))}

        {/* Synced Fog of War (3D overlay) */}
        <SyncedFogOverlay3D 
          mapSize={{ width: 1200, height: 800 }} 
          planeSize={{ width: 24, height: 16 }} 
        />

        {/* Контроллы камеры */}
        <OrbitControls 
          enableDamping 
          dampingFactor={0.1}
          maxPolarAngle={Math.PI / 2.2}
          minDistance={8}
          maxDistance={40}
          enabled={shouldHandleCameraControls()}
        />
      </Canvas>
    </div>
  );
}