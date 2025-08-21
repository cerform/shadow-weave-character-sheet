// Объединенная экосистема боевой карты
import React, { useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { useUnifiedBattleStore } from '@/stores/unifiedBattleStore';
import { EnhancedBattleToken3D } from '../enhanced/EnhancedBattleToken3D';
import { MovementIndicator } from '../enhanced/MovementIndicator';
import { FogInteractionSystem } from '../fog/FogInteractionSystem';
import { CameraControlSystem } from '../camera/CameraControlSystem';
import { BattleSystemAdapter } from '@/adapters/battleSystemAdapter';
import { interactionManager, InteractionMode } from '@/systems/interaction/InteractionModeManager';

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

  // Состояние для принудительного обновления после восстановления контекста
  const [canvasKey, setCanvasKey] = useState(0);

  // Синхронизация токенов с персонажами D&D 5e
  useEffect(() => {
    // Автоматическая инициализация боевой сцены при первом запуске
    if (tokens.length === 0 && characters.length === 0) {
      const { initializeBattleScene } = useUnifiedBattleStore.getState();
      initializeBattleScene();
    }
    
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
        color="#2d3748" 
        transparent 
        opacity={1.0}
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
      key={canvasKey} // Принудительное обновление при потере контекста
      shadows 
      camera={{ position: [0, 25, 0], fov: 45, up: [0, 0, -1] }}
      gl={{ 
        antialias: true,
        preserveDrawingBuffer: true,
        failIfMajorPerformanceCaveat: false,
        powerPreference: "high-performance"
      }}
      onCreated={({ gl, camera }) => {
        // Обработка потери и восстановления WebGL контекста
        const canvas = gl.domElement;
        
        canvas.addEventListener('webglcontextlost', (event) => {
          console.warn('🚨 WebGL контекст потерян, предотвращаем перезагрузку');
          event.preventDefault();
        });
        
        canvas.addEventListener('webglcontextrestored', () => {
          console.log('✅ WebGL контекст восстановлен, перезапускаем Canvas');
          // Принудительно перезапускаем весь Canvas через небольшую задержку
          setTimeout(() => {
            setCanvasKey(prev => prev + 1);
            
            // Восстанавливаем все системы
            setTimeout(() => {
              interactionManager.setMode(InteractionMode.TOKENS);
              interactionManager.setActive(true);
              console.log('🔄 All interaction systems restored after context recovery');
            }, 200);
          }, 100);
        });
        
        // Настройка камеры
        camera.position.set(0, 20, 0);
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();
        
        // Принудительно обновляем renderer
        gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        gl.setSize(window.innerWidth, window.innerHeight);
        
        // Инициализируем режим взаимодействия
        interactionManager.setMode(InteractionMode.TOKENS);
        interactionManager.setActive(true);
        console.log('🎮 Battle ecosystem initialized with active TOKENS mode');
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
      <gridHelper 
        args={[24, 24, "#22c55e", "#64748b"]} 
        position={[0, 0, 0]}
      />
      
      {/* Дополнительная сетка с номерами для ДМ */}
      {settings.showGridNumbers && isDM && (
        <gridHelper 
          args={[24, 24, "#3b82f6", "#475569"]} 
          position={[0, 0.01, 0]}
        />
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