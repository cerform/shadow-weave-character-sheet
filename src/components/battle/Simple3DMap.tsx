import React, { Suspense } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
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

// Компонент плоскости с текстурой карты
const TexturedPlane: React.FC<{ imageUrl?: string }> = ({ imageUrl }) => {
  let texture = null;
  
  try {
    if (imageUrl) {
      texture = useLoader(THREE.TextureLoader, imageUrl);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.flipY = false;
    }
  } catch (error) {
    console.warn('Failed to load texture:', error);
  }

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[24, 16]} />
      <meshStandardMaterial 
        map={texture} 
        color={texture ? '#ffffff' : '#4a5568'}
      />
    </mesh>
  );
};

// Токен с правильным цветом и текстом
const Token3D: React.FC<{
  position: [number, number, number];
  color: string;
  name: string;
}> = ({ position, color, name }) => {
  return (
    <group position={position}>
      {/* Основной токен */}
      <mesh castShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.8, 12]} />
        <meshStandardMaterial color={color || '#3b82f6'} />
      </mesh>
      
      {/* Название токена */}
      <Text
        position={[0, 1.2, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="black"
      >
        {name}
      </Text>
      
      {/* Тень под токеном */}
      <mesh position={[0, -0.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.5, 16]} />
        <meshBasicMaterial color="#000000" opacity={0.3} transparent />
      </mesh>
    </group>
  );
};

const Simple3DMap: React.FC<Simple3DMapProps> = ({ mapImageUrl, tokens = [] }) => {
  console.log('🗺️ Simple3DMap rendering with:', { mapImageUrl, tokensCount: tokens.length });
  
  return (
    <div className="w-full h-full">
      <Canvas 
        camera={{ position: [12, 8, 12], fov: 60 }}
        shadows
      >
        <Suspense fallback={null}>
          {/* Освещение */}
          <ambientLight intensity={0.4} />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={0.8} 
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          
          {/* Плоскость с текстурой карты */}
          <TexturedPlane imageUrl={mapImageUrl} />
          
          {/* Токены */}
          {tokens.map((token) => {
            // Конвертируем координаты из пикселей в 3D координаты
            // Предполагаем, что карта 1200x800 пикселей соответствует 24x16 единицам в 3D
            const x = ((token.x || 0) / 1200) * 24 - 12; // Центрируем по X
            const z = ((token.y || 0) / 800) * 16 - 8;   // Центрируем по Z
            
            return (
              <Token3D
                key={token.id}
                position={[x, 0.4, -z]} // Инвертируем Z для правильной ориентации
                color={token.color || '#3b82f6'}
                name={token.name || 'Token'}
              />
            );
          })}
          
          {/* Контролы */}
          <OrbitControls 
            enablePan 
            enableZoom 
            enableRotate
            minDistance={5}
            maxDistance={30}
            maxPolarAngle={Math.PI / 2}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Simple3DMap;