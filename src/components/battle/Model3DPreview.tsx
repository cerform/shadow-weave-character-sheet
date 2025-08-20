// src/components/battle/Model3DPreview.tsx
import React, { useRef } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

interface Model3DPreviewProps {
  url: string;
}

export const Model3DPreview: React.FC<Model3DPreviewProps> = ({ url }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  let gltf;
  try {
    gltf = useLoader(GLTFLoader, url);
  } catch (error) {
    console.warn('Failed to load model:', url, error);
    return (
      <mesh>
        <cylinderGeometry args={[0.5, 0.5, 1, 8]} />
        <meshPhongMaterial color="gray" />
      </mesh>
    );
  }

  // Анимация вращения
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5;
    }
  });

  if (!gltf) return null;

  // Клонируем сцену для предотвращения конфликтов
  const clonedScene = gltf.scene.clone();
  
  // Масштабируем модель под размер превью
  const box = new THREE.Box3().setFromObject(clonedScene);
  const size = box.getSize(new THREE.Vector3());
  const maxDimension = Math.max(size.x, size.y, size.z);
  const scale = 2 / maxDimension;
  clonedScene.scale.setScalar(scale);
  
  // Центрируем модель
  box.setFromObject(clonedScene);
  const center = box.getCenter(new THREE.Vector3());
  clonedScene.position.sub(center);

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} />
    </group>
  );
};