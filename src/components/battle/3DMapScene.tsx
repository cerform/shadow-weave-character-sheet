// src/components/battle/3DMapScene.tsx

import React, { Suspense } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import { useFogLayer } from '@/components/battle/hooks/useFogLayer';
import { useFogStore } from '@/stores/fogStore';
import { useEffect } from 'react';

interface MapPlaneProps {
  textureUrl: string;
  width: number;
  height: number;
}

const MapPlane: React.FC<MapPlaneProps> = ({ textureUrl, width, height }) => {
  const texture = useTexture(textureUrl);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
};

const LightSetup = () => (
  <>
    <ambientLight intensity={0.5} />
    <directionalLight position={[10, 20, 10]} intensity={1.2} castShadow />
  </>
);

// Компонент для подключения fog renderer
const FogLayer = ({ tileSize = 5 }: { tileSize?: number }) => {
  const { scene } = useThree();
  
  // Подключаем volumetric fog
  useFogLayer(scene, 'main-map', tileSize);
  
  // Инициализируем туман при первом запуске
  useEffect(() => {
    const w = 30, h = 30;
    useFogStore.getState().setMap('main-map', new Uint8Array(w * h), w, h); // всё в тумане
    // Открываем стартовую область
    useFogStore.getState().reveal('main-map', 15, 15, 3);
  }, []);
  
  return null;
};

const Fallback = () => (
  <div className="w-full h-full flex items-center justify-center text-muted text-sm">
    Карта не загружена. DM должен загрузить изображение карты.
  </div>
);

interface MapSceneProps {
  imageUrl: string | null;
  gridSize?: number;
  gridWidth?: number;
  gridHeight?: number;
  isDM?: boolean;
}

const MapScene: React.FC<MapSceneProps> = ({
  imageUrl,
  gridSize = 1,
  gridWidth = 24,
  gridHeight = 20,
  isDM = false,
}) => {
  if (!imageUrl) return <Fallback />;

  const width = gridWidth * gridSize;
  const height = gridHeight * gridSize;

  return (
    <Canvas
      shadows
      camera={{ position: [0, 30, 30], fov: 50 }}
      style={{ width: '100%', height: '100%' }}
    >
      <Suspense fallback={null}>
        <MapPlane textureUrl={imageUrl} width={width} height={height} />
        <LightSetup />
        <FogLayer tileSize={gridSize} />
      </Suspense>
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
    </Canvas>
  );
};

export default MapScene;