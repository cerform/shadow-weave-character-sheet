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
import { WorkingFogSystem } from './WorkingFogSystem';
import { SimpleBattleUI } from './SimpleBattleUI';

interface BattleMap3DProps {
  sessionId?: string;
  mapId?: string;
  paintMode?: 'reveal' | 'hide';
  brushSize?: number;
}

// Удаляем старый неработающий компонент ModernFog

export default function BattleMap3D({ 
  sessionId = 'default-session', 
  mapId = 'default-map'
}: Partial<BattleMap3DProps> = {}) {
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
  const [uiPaintMode, setUiPaintMode] = useState<'reveal' | 'hide'>('reveal');
  const [uiBrushSize, setUiBrushSize] = useState(0);
  
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
    console.log('📁 handleFileSelect called with event:', event.target.files?.length);
    const file = event.target.files?.[0];
    if (file) {
      console.log('📁 File selected:', file.name, file.type, file.size);
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        console.log('🗺️ Creating object URL:', url);
        setMapImageUrl(url);
        console.log('🗺️ Map image loaded successfully');
      } else {
        console.log('❌ Invalid file type:', file.type);
      }
    } else {
      console.log('❌ No file selected');
    }
    // Очищаем input чтобы можно было загрузить тот же файл снова
    event.target.value = '';
  };

  const handleUploadMap = () => {
    console.log('📁 handleUploadMap called - triggering file input click');
    console.log('📁 fileInputRef.current:', fileInputRef.current);
    if (fileInputRef.current) {
      fileInputRef.current.click();
      console.log('📁 File input clicked');
    } else {
      console.log('❌ File input ref is null');
    }
  };

  const handleClearMap = () => {
    console.log('🗑️ handleClearMap called');
    console.log('🗑️ Current mapImageUrl:', mapImageUrl);
    clearMap();
    console.log('🗑️ Map cleared');
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
      <SimpleBattleUI
        paintMode={uiPaintMode}
        setPaintMode={setUiPaintMode}
        brushSize={uiBrushSize}
        setBrushSize={setUiBrushSize}
        onUploadMap={handleUploadMap}
        onClearMap={handleClearMap}
      />

      {/* Скрытый инпут для загрузки карты */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {/* 3D Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas
        ref={canvasRef}
        shadows 
        camera={{ position: [0, 25, 0], fov: 45, up: [0, 0, -1] }}
        gl={{ antialias: true }}
        onCreated={({ gl }) => {
          // Устанавливаем ссылку на канвас для системы управления
          canvasRef.current = gl.domElement;
          
          // Отладка событий мыши на канвасе
          const canvas = gl.domElement;
          
          console.log('🖥️ Canvas created, adding mouse debug listeners');
          
          const debugMouseDown = (e: MouseEvent) => {
            console.log('🖱️ Canvas mousedown:', {
              button: e.button,
              clientX: e.clientX,
              clientY: e.clientY,
              target: (e.target as HTMLElement)?.tagName,
              timestamp: Date.now()
            });
          };
          
          const debugMouseMove = (e: MouseEvent) => {
            console.log('🖱️ Canvas mousemove:', {
              clientX: e.clientX,
              clientY: e.clientY,
              buttons: e.buttons,
              timestamp: Date.now()
            });
          };
          
          const debugMouseUp = (e: MouseEvent) => {
            console.log('🖱️ Canvas mouseup:', {
              button: e.button,
              clientX: e.clientX,
              clientY: e.clientY,
              timestamp: Date.now()
            });
          };
          
          const debugClick = (e: MouseEvent) => {
            console.log('🖱️ Canvas click:', {
              button: e.button,
              clientX: e.clientX,
              clientY: e.clientY,
              timestamp: Date.now()
            });
          };
          
          const debugPointerDown = (e: PointerEvent) => {
            console.log('👆 Canvas pointerdown:', {
              pointerId: e.pointerId,
              pointerType: e.pointerType,
              clientX: e.clientX,
              clientY: e.clientY,
              timestamp: Date.now()
            });
          };
          
          canvas.addEventListener('mousedown', debugMouseDown);
          canvas.addEventListener('mousemove', debugMouseMove);
          canvas.addEventListener('mouseup', debugMouseUp);
          canvas.addEventListener('click', debugClick);
          canvas.addEventListener('pointerdown', debugPointerDown);
          
          // Очистка обработчиков при размонтировании
          return () => {
            canvas.removeEventListener('mousedown', debugMouseDown);
            canvas.removeEventListener('mousemove', debugMouseMove);
            canvas.removeEventListener('mouseup', debugMouseUp);
            canvas.removeEventListener('click', debugClick);
            canvas.removeEventListener('pointerdown', debugPointerDown);
          };
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

        {/* Рабочая система тумана */}
        <WorkingFogSystem paintMode={uiPaintMode} brushSize={uiBrushSize} />

        {/* Контроллы камеры - работают только в режиме камеры */}
        <OrbitControls 
          enableDamping 
          dampingFactor={0.1}
          maxPolarAngle={Math.PI / 2.2}
          minDistance={8}
          maxDistance={40}
          enabled={shouldHandleCameraControls() && !isActiveTokenDragging}
          enableRotate={shouldHandleCameraControls()}
          enableZoom={shouldHandleCameraControls()}
          enablePan={shouldHandleCameraControls()}
        />
        </Canvas>
      </div>
    </div>
  );
}