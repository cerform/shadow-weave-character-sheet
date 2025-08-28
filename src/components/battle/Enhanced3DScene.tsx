// Улучшенная 3D сцена с эффектами
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, Plane, Text } from '@react-three/drei';
import * as THREE from 'three';
import { WorkingFogSystem } from './ui/WorkingFogSystem';

interface Enhanced3DSceneProps {
  mapImageUrl?: string;
  children?: React.ReactNode;
  fogEnabled?: boolean;
  brushSize?: number;
  paintMode?: 'reveal' | 'hide';
  className?: string;
}

// Компонент для фона карты
function MapBackground({ imageUrl }: { imageUrl?: string }) {
  if (!imageUrl) {
    return (
      <group>
        {/* Красивая плоскость с градиентом */}
        <Plane args={[24, 16]} rotation-x={-Math.PI / 2} position={[0, -0.01, 0]}>
          <meshStandardMaterial 
            color="#1e293b"
            roughness={0.8}
            metalness={0.1}
          />
        </Plane>
        
        {/* Текст-подсказка */}
        <Text
          position={[0, 0.1, 0]}
          rotation-x={-Math.PI / 2}
          fontSize={1}
          color="#64748b"
          anchorX="center"
          anchorY="middle"
        >
          Загрузите карту для начала игры
        </Text>
      </group>
    );
  }

  return (
    <Plane args={[24, 16]} rotation-x={-Math.PI / 2} position={[0, 0, 0]}>
      <meshStandardMaterial>
        <primitive 
          attach="map" 
          object={new THREE.TextureLoader().load(imageUrl)} 
        />
      </meshStandardMaterial>
    </Plane>
  );
}

// Компонент освещения
function SceneLighting() {
  return (
    <>
      {/* Мягкое окружающее освещение */}
      <ambientLight intensity={0.6} color="#f1f5f9" />
      
      {/* Основной направленный свет */}
      <directionalLight
        position={[10, 20, 5]}
        intensity={1}
        color="#ffffff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
      />
      
      {/* Заполняющий свет */}
      <directionalLight
        position={[-5, 10, -5]}
        intensity={0.3}
        color="#93c5fd"
      />
      
      {/* Точечный свет для акцента */}
      <pointLight
        position={[0, 5, 0]}
        intensity={0.5}
        color="#fbbf24"
        distance={20}
        decay={2}
      />
    </>
  );
}

// Компонент сетки
function SceneGrid() {
  return (
    <Grid
      position={[0, 0.001, 0]}
      args={[24, 16]}
      cellSize={1}
      cellThickness={0.5}
      cellColor="#374151"
      sectionSize={5}
      sectionThickness={1}
      sectionColor="#4b5563"
      fadeDistance={30}
      fadeStrength={1}
      infiniteGrid={false}
    />
  );
}

// Загрузчик
function SceneLoader() {
  return (
    <mesh position={[0, 1, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#3b82f6" wireframe />
    </mesh>
  );
}

export default function Enhanced3DScene({ 
  mapImageUrl, 
  children, 
  fogEnabled = true,
  brushSize = 3,
  paintMode = 'reveal',
  className 
}: Enhanced3DSceneProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ 
          position: [0, 15, 10], 
          fov: 60,
          near: 0.1,
          far: 1000
        }}
        shadows
        gl={{ 
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2
        }}
      >
        <Suspense fallback={<SceneLoader />}>
          {/* Освещение */}
          <SceneLighting />
          
          {/* Окружение */}
          <Environment preset="dawn" background={false} />
          
          {/* Фон карты */}
          <MapBackground imageUrl={mapImageUrl} />
          
          {/* Сетка */}
          <SceneGrid />
          
          {/* Туман войны */}
          {fogEnabled && (
            <WorkingFogSystem 
              paintMode={paintMode}
              brushSize={brushSize}
            />
          )}
          
          {/* Дополнительный контент */}
          {children}
          
          {/* Управление камерой */}
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            minDistance={5}
            maxDistance={40}
            maxPolarAngle={Math.PI / 2.1}
            target={[0, 0, 0]}
            enablePan={true}
            panSpeed={1}
            rotateSpeed={0.5}
            zoomSpeed={0.8}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}