import React, { Suspense, useMemo, useRef, useEffect, useState } from "react";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useBattleUIStore } from "@/stores/battleUIStore";
import BattleToken3D from "./BattleToken3D";
import { useEnhancedBattleStore } from "@/stores/enhancedBattleStore";
import { EnhancedBattleToken3D } from "../enhanced/EnhancedBattleToken3D";
import { MovementIndicator } from "../enhanced/MovementIndicator";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { FogInteractionSystem } from '../fog/FogInteractionSystem';
import { CameraControlSystem } from '../camera/CameraControlSystem';
import { SimpleBattleUI } from './SimpleBattleUI';
import MiniMap from '../minimap/MiniMap';
import SessionChat from '@/components/session/SessionChat';
import { SessionAudioPlayer } from '@/components/session/SessionAudioPlayer';
import { useSessionSync } from '@/hooks/useSessionSync';
import ZoomControls from './ZoomControls';

interface BattleMap3DProps {
  sessionId?: string;
  mapId?: string;
  paintMode?: 'reveal' | 'hide';
  brushSize?: number;
}

export default function BattleMap3D({ 
  sessionId = 'default-session',
  mapId = 'main-map',
  isDM = false
}: Partial<BattleMap3DProps> & { isDM?: boolean }) {
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
  
  // Стабилизируем список токенов чтобы избежать ошибки #185
  const stableTokens = useMemo(() => {
    return enhancedTokens.filter(token => token && token.id);
  }, [enhancedTokens]);
  
  const { sessionState, updateSessionState } = useSessionSync(sessionId);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Состояние для современного UI
  const [uiPaintMode, setUiPaintMode] = useState<'reveal' | 'hide'>('reveal');
  const [uiBrushSize, setUiBrushSize] = useState(0);
  
  // Проверяем, перетаскивается ли активный токен
  const isActiveTokenDragging = enhancedTokens.some(token => 
    token.id === enhancedActiveId && showMovementGrid
  );

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
        
        // Синхронизируем с другими участниками
        if (isDM) {
          updateSessionState({ current_map_url: url });
        }
        
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
    
    // Синхронизируем с другими участниками
    if (isDM) {
      updateSessionState({ current_map_url: null });
    }
    
    console.log('🗑️ Map cleared');
  };

  // Синхронизируем URL карты с состоянием сессии
  useEffect(() => {
    if (sessionState?.current_map_url && sessionState.current_map_url !== mapImageUrl) {
      setMapImageUrl(sessionState.current_map_url);
    }
  }, [sessionState?.current_map_url, mapImageUrl]);

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
      {/* Современный UI - только для ДМ */}
      {isDM && (
        <SimpleBattleUI
          paintMode={uiPaintMode}
          setPaintMode={setUiPaintMode}
          brushSize={uiBrushSize}
          setBrushSize={setUiBrushSize}
          onUploadMap={handleUploadMap}
          onClearMap={handleClearMap}
        />
      )}

      {/* Чат сессии */}
      <SessionChat sessionId={sessionId} />
      
      {/* Аудио плеер */}
      <SessionAudioPlayer 
        sessionId={sessionId} 
        isDM={isDM}
        className="fixed bottom-4 left-4"
      />

      {/* Современный UI */}
      {/* Скрытый инпут для загрузки карты - только для ДМ */}
      {isDM && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      )}
      
      {/* 3D Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas
          ref={canvasRef}
          shadows 
          camera={{ position: [0, 25, 0], fov: 45, up: [0, 0, -1] }}
          gl={{ antialias: true }}
          onCreated={({ gl, camera }) => {
            // Устанавливаем фиксированную позицию камеры
            camera.position.set(0, 20, 0);
            camera.lookAt(0, 0, 0);
            camera.updateProjectionMatrix();
            
            // Устанавливаем ссылку на канвас
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
          {stableTokens.map((token) => (
            <EnhancedBattleToken3D key={token.id} token={token} />
          ))}

          {/* Индикатор доступных клеток для движения */}
          {enhancedActiveId && (
            <MovementIndicator 
              tokenId={enhancedActiveId} 
              visible={showMovementGrid}
            />
          )}

          {/* Система управления камерой */}
          <CameraControlSystem />
          
          {/* Система взаимодействия с туманом */}
          <FogInteractionSystem 
            paintMode={uiPaintMode}
            brushSize={uiBrushSize}
            sessionId={sessionId}
            mapId={mapId}
          />
        </Canvas>
      </div>
      
      {/* Контролы масштаба для 3D карты */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 bg-background/90 backdrop-blur-sm border border-border rounded-lg p-2">
        <ZoomControls canvasRef={canvasRef} />
      </div>
      
      {/* Мини-карта */}
      <MiniMap />
    </div>
  );
}