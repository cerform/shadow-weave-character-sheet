import React, { Suspense, useMemo, useRef, useEffect, useState } from "react";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import { useBattleUIStore } from "@/stores/battleUIStore";
import BattleToken3D from "./BattleToken3D";
import { useEnhancedBattleStore } from "@/stores/enhancedBattleStore";
import { EnhancedBattleToken3D } from "../enhanced/EnhancedBattleToken3D";
import { MovementIndicator } from "../enhanced/MovementIndicator";
import { useBattle3DControls } from "@/hooks/useBattle3DControls";
import { useBattle3DControlStore } from "@/stores/battle3DControlStore";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { useFogLayer } from "@/components/battle/hooks/useFogLayer";
import { useFogStore } from "@/stores/fogStore";
import { useFogPainting } from "@/hooks/useFogPainting";
import { ModernBattleUI } from './ModernBattleUI';

interface BattleMap3DProps {
  sessionId?: string;
  mapId?: string;
  paintMode?: 'reveal' | 'hide';
  brushSize?: number;
}

// Оптимизированный компонент тумана - не создаем сферы там где не нужно
const OptimizedFog = ({ paintMode, brushSize }: { paintMode: 'reveal' | 'hide'; brushSize: number }) => {
  const { scene, gl } = useThree();
  const { handlePointerDown, handlePointerMove, handlePointerUp } = useFogPainting({
    mode: paintMode,
    brushSize,
    mapId: 'main-map',
    tileSize: 1
  });
  
  // Используем умную систему тумана - только на границах
  useFogLayer(scene, 'main-map', 1);
  
  // Инициализируем только стартовые области с туманом
  useEffect(() => {
    console.log('Initializing optimized fog map...');
    const w = 24, h = 24;
    const fogMap = new Uint8Array(w * h);
    
    // Открываем центральную область, остальное в тумане
    fogMap.fill(0); // все закрыто
    
    // Открываем только стартовую зону
    for (let y = 10; y < 14; y++) {
      for (let x = 10; x < 14; x++) {
        fogMap[y * w + x] = 1; // открыто
      }
    }
    
    useFogStore.getState().setMap('main-map', fogMap, w, h);
    console.log('Optimized fog initialized - only necessary areas');
  }, []);

  // Подключаем обработчики событий к канвасу
  useEffect(() => {
    const canvas = gl.domElement;
    
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointerleave', handlePointerUp);
    
    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointerleave', handlePointerUp);
    };
  }, [handlePointerDown, handlePointerMove, handlePointerUp]);
  
  return null;
};

export default function BattleMap3D({ 
  sessionId = 'default-session', 
  mapId = 'default-map',
  paintMode = 'reveal',
  brushSize = 0
}: BattleMap3DProps = {}) {
  const tokens = useBattleUIStore((s) => s.tokens);
  const { 
    tokens: enhancedTokens, 
    selectedTokenId, 
    activeId: enhancedActiveId,
    showMovementGrid,
    mapImageUrl,
    setMapImageUrl,
    clearMap
  } = useEnhancedBattleStore();
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { shouldHandleCameraControls } = useBattle3DControlStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Состояние для современного UI
  const [uiPaintMode, setUiPaintMode] = useState<'reveal' | 'hide'>(paintMode);
  const [uiBrushSize, setUiBrushSize] = useState(brushSize);
  
  // Проверяем, перетаскивается ли активный токен
  const isActiveTokenDragging = enhancedTokens.some(token => 
    token.id === enhancedActiveId && showMovementGrid
  );

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

  // Map Texture Components
  const MapPlaneWithTexture = ({ imageUrl }: { imageUrl: string }) => {
    const texture = useLoader(THREE.TextureLoader, imageUrl);
    
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

  const MapPlaneDefault = () => (
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
      <planeGeometry args={[24, 16]} />
      <meshStandardMaterial 
        color="#2a2a3e" 
        transparent 
        opacity={0.8}
      />
    </mesh>
  );

  return (
    <div className="w-full h-full relative bg-background rounded-xl overflow-hidden border border-border">
      {/* Современный UI */}
      <ModernBattleUI
        paintMode={uiPaintMode}
        setPaintMode={setUiPaintMode}
        brushSize={uiBrushSize}
        setBrushSize={setUiBrushSize}
        onUploadMap={() => fileInputRef.current?.click()}
        onClearMap={clearMap}
      />

      {/* Скрытый инпут для загрузки карты */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

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
        {mapImageUrl ? (
          <React.Suspense fallback={<MapPlaneDefault />}>
            <MapPlaneWithTexture imageUrl={mapImageUrl} />
          </React.Suspense>
        ) : (
          <MapPlaneDefault />
        )}

        {/* Сетка поля */}
        <gridHelper args={[24, 24, "hsl(var(--primary))", "hsl(var(--muted))"]} />

        {/* Токены с улучшенной механикой движения */}
        {enhancedTokens.map((token) => (
          <EnhancedBattleToken3D key={token.id} token={token} />
        ))}

        {/* Индикатор доступных клеток для движения */}
        {enhancedActiveId && (
          <MovementIndicator 
            tokenId={enhancedActiveId} 
            visible={showMovementGrid}
          />
        )}

        {/* Оптимизированная система тумана */}
        <OptimizedFog paintMode={uiPaintMode} brushSize={uiBrushSize} />

        {/* Контроллы камеры - отключаем при перетаскивании токена */}
        <OrbitControls 
          enableDamping 
          dampingFactor={0.1}
          maxPolarAngle={Math.PI / 2.2}
          minDistance={8}
          maxDistance={40}
          enabled={shouldHandleCameraControls() && !isActiveTokenDragging}
        />
      </Canvas>
    </div>
  );
}