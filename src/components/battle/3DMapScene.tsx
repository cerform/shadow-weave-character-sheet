// src/components/battle/3DMapScene.tsx

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';

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
      </Suspense>
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
    </Canvas>
  );
};

export default MapScene;