import React from "react";
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
import { Upload, X, Eye, EyeOff, Paintbrush2, Eraser, RotateCcw, Square } from "lucide-react";
import { useUnifiedFogStore } from "@/stores/unifiedFogStore";
import { Fog3DInteractor } from "../Fog3DInteractor";

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
  
  // Fog controls
  const { 
    enabled: fogEnabled, 
    activeMode, 
    brushSize,
    setEnabled: setFogEnabled,
    setActiveMode,
    setBrushSize,
    revealAll,
    hideAll,
    revealArea,
    hideArea
  } = useUnifiedFogStore();
  
  const [isDM] = useState(true); // В реальном приложении это будет из контекста пользователя

  // Initialize fog grid size for 3D map
  useEffect(() => {
    console.log('🌫️ Initializing fog grid for 3D map');
    setMapSize({ width: 1200, height: 800 }, 40);
    setFogEnabled(true); // Enable fog by default
  }, [setMapSize, setFogEnabled]);

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

        {/* Fog Controls - только для DM */}
        {isDM && (
          <div className="space-y-2 border-t border-gray-600 pt-3">
            <h3 className="text-sm font-medium text-white">Туман войны</h3>
            
            {/* Fog On/Off */}
            <Button
              onClick={() => setFogEnabled(!fogEnabled)}
              size="sm"
              variant={fogEnabled ? "default" : "secondary"}
              className="flex items-center gap-2 text-xs w-full"
            >
              {fogEnabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              {fogEnabled ? 'Вкл' : 'Выкл'}
            </Button>

            {fogEnabled && (
              <>
                {/* Mode Toggle */}
                <Button
                  onClick={() => setActiveMode(activeMode === 'map' ? 'fog' : 'map')}
                  size="sm"
                  variant={activeMode === 'fog' ? "default" : "secondary"}
                  className="flex items-center gap-2 text-xs w-full"
                >
                  {activeMode === 'fog' ? <Paintbrush2 className="w-3 h-3" /> : <Square className="w-3 h-3" />}
                  {activeMode === 'fog' ? 'Редактор' : 'Просмотр'}
                </Button>

                {/* Brush Size */}
                {activeMode === 'fog' && (
                  <div className="space-y-1">
                    <label className="text-xs text-gray-300">Кисть: {brushSize}px</label>
                    <input
                      type="range"
                      min="50"
                      max="300"
                      step="25"
                      value={brushSize}
                      onChange={(e) => setBrushSize(Number(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex gap-1">
                  <Button
                    onClick={() => revealAll()}
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                  >
                    Показать все
                  </Button>
                  <Button
                    onClick={() => hideAll()}
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                  >
                    Скрыть все
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Status */}
        <div className="text-xs text-gray-400 border-t border-gray-600 pt-2">
          <div>Режим: {activeMode === 'fog' ? 'Туман' : 'Карта'}</div>
          <div>Карта: {mapImageUrl ? 'загружена' : 'нет'}</div>
          <div>Туман: {fogEnabled ? 'включен' : 'выключен'}</div>
          {activeMode === 'fog' && (
            <div className="text-yellow-400 text-xs mt-1">
              ЛКМ - открыть | Shift+ЛКМ - скрыть
            </div>
          )}
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

        {/* Токены */}
        {tokens.map((token) => (
          <BattleToken3D key={token.id} token={token} />
        ))}

        {/* Synced Fog of War (3D overlay) - только если включен */}
        {fogEnabled && (
          <SyncedFogOverlay3D 
            mapSize={{ width: 1200, height: 800 }} 
            planeSize={{ width: 24, height: 16 }} 
          />
        )}

        {/* Interactive fog controls for DM */}
        {isDM && activeMode === 'fog' && (
          <Fog3DInteractor />
        )}

        {/* Контроллы камеры - отключаем при рисовании тумана */}
        <OrbitControls 
          enableDamping 
          dampingFactor={0.1}
          maxPolarAngle={Math.PI / 2.2}
          minDistance={8}
          maxDistance={40}
          enabled={shouldHandleCameraControls() && activeMode !== 'fog'}
        />
      </Canvas>
    </div>
  );
}