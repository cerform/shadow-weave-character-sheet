import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface Simple3DMapProps {
  mapImageUrl?: string;
  tokens?: Array<{
    id: string;
    name: string;
    x: number;
    y: number;
    color: string;
    size: number;
    type: string;
  }>;
}

// Простой компонент плоскости без сложной геометрии
const SimplePlane: React.FC<{ imageUrl?: string }> = ({ imageUrl }) => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#4a5568" />
    </mesh>
  );
};

// Простой токен без сложных эффектов
const SimpleToken3D: React.FC<{
  position: [number, number, number];
  color: string;
  name: string;
}> = ({ position, color, name }) => {
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.5, 0.5, 1, 8]} />
        <meshStandardMaterial color={color || '#3b82f6'} />
      </mesh>
    </group>
  );
};

const Simple3DMap: React.FC<Simple3DMapProps> = ({ mapImageUrl, tokens = [] }) => {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [10, 10, 10], fov: 60 }}>
        <Suspense fallback={null}>
          {/* Освещение */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          
          {/* Простая плоскость */}
          <SimplePlane imageUrl={mapImageUrl} />
          
          {/* Простые токены */}
          {tokens.map((token) => (
            <SimpleToken3D
              key={token.id}
              position={[
                (token.x || 0) / 50 - 10,
                0.5,
                (token.y || 0) / 50 - 10
              ]}
              color={token.color || '#3b82f6'}
              name={token.name || 'Token'}
            />
          ))}
          
          {/* Контролы */}
          <OrbitControls enablePan enableZoom enableRotate />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Simple3DMap;