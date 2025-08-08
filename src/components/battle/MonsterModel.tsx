import React, { Suspense, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { monsterTypes, MonsterType } from '@/data/monsterTypes';

interface MonsterModelProps {
  type: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
}

function Model({ 
  monsterData, 
  position, 
  rotation = [0, 0, 0], 
  isSelected, 
  isHovered,
  onClick 
}: { 
  monsterData: MonsterType;
  position: [number, number, number];
  rotation?: [number, number, number];
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Try to load the model, fallback to basic geometry if model doesn't exist
  let gltf = null;
  try {
    gltf = useGLTF(monsterData.modelPath);
  } catch (error) {
    console.warn(`Failed to load model: ${monsterData.modelPath}`, error);
  }

  useFrame((state) => {
    if (groupRef.current) {
      // Subtle floating animation for hovered/selected monsters
      if (isHovered || isSelected) {
        groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      } else {
        groupRef.current.position.y = position[1];
      }
      
      // Subtle rotation for selected monsters
      if (isSelected) {
        groupRef.current.rotation.y += 0.01;
      }
    }
  });

  return (
    <group 
      ref={groupRef}
      position={position}
      rotation={rotation}
      onClick={onClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      {gltf ? (
        <primitive
          object={gltf.scene.clone()}
          scale={monsterData.scale}
          castShadow
          receiveShadow
        />
      ) : (
        // Fallback geometry if model doesn't load
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.4, 0.4, 0.8, 8]} />
          <meshStandardMaterial 
            color={monsterData.color}
            transparent
            opacity={isHovered ? 0.8 : 1.0}
          />
        </mesh>
      )}
      
      {/* Selection indicator */}
      {isSelected && (
        <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.6, 0.8, 16]} />
          <meshBasicMaterial 
            color="#fbbf24" 
            transparent 
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      
      {/* Shadow */}
      <mesh position={[0, -0.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.5, 16]} />
        <meshBasicMaterial 
          color="#000000" 
          opacity={0.3} 
          transparent 
        />
      </mesh>
    </group>
  );
}

export function MonsterModel({ 
  type, 
  position, 
  rotation = [0, 0, 0], 
  isSelected = false,
  isHovered = false,
  onClick
}: MonsterModelProps) {
  const monsterData = monsterTypes[type];
  
  if (!monsterData) {
    console.warn(`Monster type "${type}" not found`);
    return null;
  }

  return (
    <Suspense fallback={
      <mesh position={position} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.8, 8]} />
        <meshStandardMaterial color="#6b7280" />
      </mesh>
    }>
      <Model
        monsterData={monsterData}
        position={position}
        rotation={rotation}
        isSelected={isSelected}
        isHovered={isHovered}
        onClick={onClick}
      />
    </Suspense>
  );
}

// Preload models for better performance
export function preloadMonsterModels() {
  Object.values(monsterTypes).forEach(monster => {
    try {
      useGLTF.preload(monster.modelPath);
    } catch (error) {
      console.warn(`Failed to preload model: ${monster.modelPath}`);
    }
  });
}