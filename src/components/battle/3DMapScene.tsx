// src/components/battle/3DMapScene.tsx

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import { Vector3 } from 'three';

interface MapPlaneProps {
  textureUrl: string;
  width: number;
  height: number;
  gridSize: number;
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

const LightSetup = () => {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
    </>
  );
};

const GridHelperPlane: React.FC<{ width: number; height: number; size: number }> = ({
  width,
  height,
  size,
}) => {
  // Создаем простую сетку с помощью gridHelper или линий
  return (
    <group>
      {/* Используем встроенный gridHelper */}
      <gridHelper 
        args={[Math.max(width, height), Math.max(width, height) / size]} 
        position={[0, 0.01, 0]}
      />
    </group>
  );
};

interface MapSceneProps {
  imageUrl: string;
  gridSize?: number;
  gridWidth?: number;
  gridHeight?: number;
}

const MapScene: React.FC<MapSceneProps> = ({
  imageUrl,
  gridSize = 1,
  gridWidth = 24,
  gridHeight = 20,
}) => {
  const width = gridWidth * gridSize;
  const height = gridHeight * gridSize;

  return (
    <Canvas
      shadows
      camera={{ position: [0, 30, 30], fov: 50 }}
      style={{ width: '100%', height: '100vh' }}
    >
      <Suspense fallback={null}>
        <MapPlane textureUrl={imageUrl} width={width} height={height} gridSize={gridSize} />
        <GridHelperPlane width={width} height={height} size={gridSize} />
      </Suspense>
      <LightSetup />
      <OrbitControls enablePan enableZoom enableRotate />
    </Canvas>
  );
};

export default MapScene;