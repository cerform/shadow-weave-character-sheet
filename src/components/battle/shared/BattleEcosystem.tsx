// Объединенная экосистема боевой карты
import React, { useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { useUnifiedBattleStore } from '@/stores/unifiedBattleStore';
import { EnhancedBattleToken3D } from '../enhanced/EnhancedBattleToken3D';
import { MovementIndicator } from '../enhanced/MovementIndicator';
import { FogInteractionSystem } from '../fog/FogInteractionSystem';
import { CameraControlSystem } from '../camera/CameraControlSystem';
import { BattleSystemAdapter } from '@/adapters/battleSystemAdapter';

interface BattleEcosystemProps {
  showFog?: boolean;
  showMovement?: boolean;
  enableCameraControls?: boolean;
}

export const BattleEcosystem: React.FC<BattleEcosystemProps> = ({
  showFog = true,
  showMovement = true,
  enableCameraControls = true,
}) => {
  const {
    tokens,
    activeId,
    showMovementGrid,
    mapImageUrl,
    paintMode,
    brushSize,
    characters,
    setCharacters,
    isDM,
    settings,
  } = useUnifiedBattleStore();

  // Синхронизация токенов с персонажами D&D 5e
  useEffect(() => {
    if (tokens.length > 0 && characters.length === 0) {
      const newCharacters = BattleSystemAdapter.createDemoCharactersFromTokens(tokens);
      setCharacters(newCharacters);
    }
  }, [tokens, characters.length, setCharacters]);

  const lighting = useMemo(() => ({
    ambient: { intensity: 0.6 },
    directional: { position: [10, 15, 5], intensity: 1 }
  }), []);

  // Компонент карты с текстурой
  const MapPlaneWithTexture = ({ imageUrl }: { imageUrl: string }) => {
    const texture = React.useMemo(() => {
      const loader = new THREE.TextureLoader();
      return loader.load(imageUrl);
    }, [imageUrl]);
    
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

  // Компонент карты по умолчанию
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

  // Фильтрация токенов для игроков (скрыть невидимые токены)
  const visibleTokens = useMemo(() => {
    if (isDM) {
      return tokens;
    }
    return tokens.filter(token => token.isVisible !== false);
  }, [tokens, isDM]);

  return (
    <Canvas
      shadows 
      camera={{ position: [0, 25, 0], fov: 45, up: [0, 0, -1] }}
      gl={{ antialias: true }}
      onCreated={({ camera }) => {
        camera.position.set(0, 20, 0);
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();
      }}
    >
      {/* Освещение */}
      <ambientLight intensity={lighting.ambient.intensity} />
      <directionalLight 
        castShadow 
        position={lighting.directional.position as [number, number, number]} 
        intensity={lighting.directional.intensity}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />

      {/* Основание карты */}
      {mapImageUrl ? (
        <React.Suspense fallback={<MapPlaneDefault />}>
          <MapPlaneWithTexture imageUrl={mapImageUrl} />
        </React.Suspense>
      ) : (
        <MapPlaneDefault />
      )}

      {/* Сетка поля */}
      {settings.showGridNumbers && (
        <gridHelper args={[24, 24, "hsl(var(--primary))", "hsl(var(--muted))"]} />
      )}

      {/* Токены */}
      {visibleTokens.map((token) => (
        <EnhancedBattleToken3D 
          key={token.id} 
          token={token} 
        />
      ))}

      {/* Система управления камерой */}
      {enableCameraControls && <CameraControlSystem />}
      
      {/* Система тумана войны (только для ДМ) */}
      {showFog && isDM && (
        <FogInteractionSystem 
          paintMode={paintMode}
          brushSize={brushSize}
        />
      )}
    </Canvas>
  );
};