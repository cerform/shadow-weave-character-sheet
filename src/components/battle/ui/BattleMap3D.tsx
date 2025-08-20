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

interface BattleMap3DProps {
  sessionId?: string;
  mapId?: string;
  paintMode?: 'reveal' | 'hide';
  brushSize?: number;
}

// Компонент для интеграции volumetric fog в 3D сцену
const VolumetricFog = ({ paintMode, brushSize }: { paintMode: 'reveal' | 'hide'; brushSize: number }) => {
  const { scene, gl } = useThree();
  const { handlePointerDown, handlePointerMove, handlePointerUp } = useFogPainting({
    mode: paintMode,
    brushSize,
    mapId: 'main-map',
    tileSize: 5
  });
  
  // Подключаем новую volumetric fog систему
  useFogLayer(scene, 'main-map', 5);
  
  // Инициализируем туман при первом запуске
  useEffect(() => {
    console.log('Initializing fog map...');
    const w = 30, h = 30;
    const fogMap = new Uint8Array(w * h);
    fogMap.fill(0); // 0 = закрыто (туман везде)
    
    useFogStore.getState().setMap('main-map', fogMap, w, h);
    console.log('Fog map initialized with size:', w, 'x', h, '- все области закрыты туманом');
    
    // Открываем стартовую область для игроков
    useFogStore.getState().reveal('main-map', 15, 15, 3);
    console.log('Initial area revealed at (15, 15) with radius 3 - ДМ открыл стартовую зону');
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
  brushSize = 3
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
      {/* Controls Panel */}
      <div className="absolute top-4 left-4 z-50 bg-black/80 p-3 rounded-xl backdrop-blur space-y-3">
        {/* Map Upload Controls */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-white">Карта</h3>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              size="sm"
              variant="secondary"
              className="flex items-center gap-2 text-xs"
            >
              <Upload className="w-3 h-3" />
              {mapImageUrl ? 'Сменить' : 'Загрузить'}
            </Button>
            
            {mapImageUrl && (
              <Button
                onClick={clearMap}
                size="sm"
                variant="destructive"
                className="flex items-center gap-2 text-xs"
              >
                <X className="w-3 h-3" />
                Убрать
              </Button>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="text-xs text-gray-400 border-t border-gray-600 pt-2">
          <div>Карта: {mapImageUrl ? 'загружена' : 'нет'}</div>
          <div>Туман: volumetric (новая система)</div>
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

        {/* Новая Volumetric Fog система с рисованием */}
        <VolumetricFog paintMode={paintMode} brushSize={brushSize} />

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