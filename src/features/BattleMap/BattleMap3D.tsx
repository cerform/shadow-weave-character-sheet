/**
 * Основная 3D сцена боевой карты
 * Карта + токены + камера + контролы
 */

import React, { useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { useBattleController } from './hooks/useBattleController';

interface BattleMap3DProps {
  className?: string;
  mapImageUrl?: string;
  onTokenClick?: (tokenId: string) => void;
  onMapClick?: (position: [number, number, number]) => void;
}

// Компонент 3D токена
const BattleToken3D: React.FC<{
  token: any;
  onTokenClick?: (tokenId: string) => void;
  modelRegistry: any;
  modelLoader: any;
}> = ({ token, onTokenClick, modelRegistry, modelLoader }) => {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [model, setModel] = useState<any>(null);

  // Загрузка 3D модели
  useEffect(() => {
    if (!modelRegistry || !modelLoader) return;

    const loadModel = async () => {
      const mapping = modelRegistry.getModelMapping(token.name, 'humanoid');
      const loadedModel = await modelLoader.loadModel(mapping.path, {
        scale: mapping.scale,
        yOffset: mapping.yOffset,
      });

      if (loadedModel) {
        setModel(loadedModel);
      } else {
        // Создаем placeholder
        const placeholder = modelLoader.createPlaceholder(
          mapping.fallbackColor || (token.isEnemy ? '#dc2626' : '#3b82f6'),
          mapping.scale,
          mapping.yOffset
        );
        setModel(placeholder);
      }
    };

    loadModel();
  }, [token.name, modelRegistry, modelLoader]);

  const handleClick = (e: any) => {
    e.stopPropagation();
    onTokenClick?.(token.id);
  };

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setHovered(false);
    document.body.style.cursor = 'default';
  };

  return (
    <group
      ref={meshRef}
      position={token.position}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* 3D модель или placeholder */}
      {model && (
        <primitive 
          object={model.scene.clone()} 
          scale={hovered ? 1.1 : 1.0}
        />
      )}

      {/* Кольцо выделения */}
      {hovered && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.6, 0.8, 16]} />
          <meshBasicMaterial 
            color={token.isEnemy ? '#dc2626' : '#3b82f6'} 
            transparent 
            opacity={0.6}
          />
        </mesh>
      )}

      {/* HP бар */}
      {token.hp < token.maxHp && (
        <group position={[0, 2.5, 0]}>
          {/* Фон */}
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[1.2, 0.2]} />
            <meshBasicMaterial color="#333333" />
          </mesh>
          
          {/* HP */}
          <mesh position={[-(1.2 * (1 - token.hp / token.maxHp)) / 2, 0, 0.02]}>
            <planeGeometry args={[1.2 * (token.hp / token.maxHp), 0.15]} />
            <meshBasicMaterial color={token.hp > token.maxHp * 0.5 ? '#22c55e' : token.hp > token.maxHp * 0.25 ? '#f59e0b' : '#dc2626'} />
          </mesh>
        </group>
      )}
    </group>
  );
};

// Компонент карты с текстурой
const MapPlane: React.FC<{ imageUrl?: string }> = ({ imageUrl }) => {
  const texture = React.useMemo(() => {
    if (!imageUrl) return null;
    const loader = new THREE.TextureLoader();
    return loader.load(imageUrl);
  }, [imageUrl]);

  return (
    <mesh 
      receiveShadow 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, -0.1, 0]}
    >
      <planeGeometry args={[24, 24]} />
      <meshStandardMaterial 
        map={texture}
        color={texture ? '#ffffff' : '#2d3748'}
        transparent 
        opacity={0.9}
      />
    </mesh>
  );
};

export const BattleMap3D: React.FC<BattleMap3DProps> = ({
  className = '',
  mapImageUrl,
  onTokenClick,
  onMapClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    isLoading,
    error,
    getTokens,
    battleEngine,
    fogOfWar,
    gridSystem,
  } = useBattleController();

  const tokens = getTokens();

  // Получаем системы из контроллера
  const { modelRegistry, modelLoader } = useBattleController();

  // Обработка клика по карте
  const handleMapClick = (event: any) => {
    if (!onMapClick || !gridSystem) return;

    const intersectPoint = event.point;
    const position: [number, number, number] = [
      intersectPoint.x,
      intersectPoint.y,
      intersectPoint.z
    ];
    
    // Привязываем к сетке
    const snapped = gridSystem.snapToGrid(position[0], position[2]); // x, z для 2D сетки
    
    onMapClick([snapped.x, position[1], snapped.y]); // y остается как высота
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-neutral-900 ${className}`}>
        <div className="text-white">Загрузка боевой системы...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-neutral-900 ${className}`}>
        <div className="text-red-400">Ошибка: {error}</div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Canvas
        ref={canvasRef}
        shadows
        camera={{ 
          position: [0, 20, 0], 
          fov: 50,
          up: [0, 0, -1] // Y вверх для изометрической проекции
        }}
        gl={{ 
          antialias: true,
        }}
        onCreated={({ gl, scene }) => {
          // Настройка теней
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
          console.log('🎮 3D Scene created');
        }}
      >
        {/* Освещение */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[10, 15, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-far={50}
          shadow-camera-left={-15}
          shadow-camera-right={15}
          shadow-camera-top={15}
          shadow-camera-bottom={-15}
        />

        {/* Туман (рассеянный свет) */}
        <fog attach="fog" args={['#1a1a1a', 25, 100]} />

        {/* Основание карты */}
        <MapPlane imageUrl={mapImageUrl} />

        {/* Сетка поля боя */}
        <Grid
          args={[24, 24]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#22c55e"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#3b82f6"
          fadeDistance={30}
          fadeStrength={1}
        />

        {/* Токены */}
        {tokens.map((token) => (
          <BattleToken3D
            key={token.id}
            token={token}
            onTokenClick={onTokenClick}
            modelRegistry={modelRegistry}
            modelLoader={modelLoader}
          />
        ))}

        {/* Контролы камеры */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={50}
          maxPolarAngle={Math.PI / 2.2} // Ограничиваем поворот вниз
          target={[0, 0, 0]}
        />

        {/* Обработчик кликов по карте */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.05, 0]}
          onClick={handleMapClick}
          visible={false} // Невидимый триггер
        >
          <planeGeometry args={[24, 24]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </Canvas>

      {/* Индикатор загрузки моделей */}
      <div className="absolute top-4 right-4 text-white text-sm bg-black/50 rounded px-2 py-1">
        Токенов: {tokens.length}
      </div>
    </div>
  );
};