import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { useMemo, useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { useBattleUIStore } from "@/stores/battleUIStore";
import BattleToken3D from "./BattleToken3D";
import { useBattle3DControls } from "@/hooks/useBattle3DControls";
import { useBattle3DControlStore } from "@/stores/battle3DControlStore";
import { SyncedFogOverlay3D } from "../SyncedFogOverlay3D";
import { useFogGridStore } from "@/stores/fogGridStore";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

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
  const [mapImageUrl, setMapImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Handle map image upload
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setMapImageUrl(url);
      console.log('🗺️ Map image loaded:', url);
    }
  };

  const clearMap = () => {
    if (mapImageUrl) {
      URL.revokeObjectURL(mapImageUrl);
    }
    setMapImageUrl(null);
  };

  // Map Texture Component
  const MapPlane = ({ imageUrl }: { imageUrl: string | null }) => {
    const texture = useLoader(THREE.TextureLoader, imageUrl || '');
    
    if (!imageUrl) {
      return (
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
          <planeGeometry args={[24, 16]} />
          <meshStandardMaterial 
            color="#2a2a3e" 
            transparent 
            opacity={0.8}
          />
        </mesh>
      );
    }

    return (
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[24, 16]} />
        <meshStandardMaterial 
          map={texture}
          transparent 
          opacity={0.9}
        />
      </mesh>
    );
  };

  return (
    <div className="w-full h-full relative bg-background rounded-xl overflow-hidden border border-border">
      {/* Map Upload Controls */}
      <div className="absolute top-4 left-4 z-50 bg-black/80 p-3 rounded-xl backdrop-blur">
        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <Button
            onClick={() => fileInputRef.current?.click()}
            size="sm"
            variant="secondary"
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {mapImageUrl ? 'Сменить карту' : 'Загрузить карту'}
          </Button>
          
          {mapImageUrl && (
            <Button
              onClick={clearMap}
              size="sm"
              variant="destructive"
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Убрать карту
            </Button>
          )}
          
          <div className="text-xs text-gray-300">
            {mapImageUrl ? 'Карта загружена' : 'Нет карты'}
          </div>
        </div>
      </div>

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
        <MapPlane imageUrl={mapImageUrl} />

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