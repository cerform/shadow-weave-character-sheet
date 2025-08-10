import React, { Suspense, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { monsterTypes, MonsterType } from '@/data/monsterTypes';

// Enhanced fallback geometry for different monster types
function MonsterFallback({ monsterData, isHovered }: { monsterData: MonsterType; isHovered?: boolean }) {
  const getMonsterGeometry = () => {
    switch (monsterData.name) {
      case "Гоблин":
        return (
          <group>
            {/* Body */}
            <mesh position={[0, 0.2, 0]} castShadow>
              <sphereGeometry args={[0.25, 8, 6]} />
              <meshStandardMaterial color={monsterData.color} />
            </mesh>
            {/* Head */}
            <mesh position={[0, 0.5, 0]} castShadow>
              <sphereGeometry args={[0.15, 8, 6]} />
              <meshStandardMaterial color={monsterData.color} />
            </mesh>
            {/* Ears */}
            <mesh position={[-0.1, 0.6, 0]} castShadow>
              <coneGeometry args={[0.05, 0.2, 4]} />
              <meshStandardMaterial color={monsterData.color} />
            </mesh>
            <mesh position={[0.1, 0.6, 0]} castShadow>
              <coneGeometry args={[0.05, 0.2, 4]} />
              <meshStandardMaterial color={monsterData.color} />
            </mesh>
          </group>
        );

      case "Орк":
        return (
          <group>
            {/* Body */}
            <mesh position={[0, 0.3, 0]} castShadow>
              <cylinderGeometry args={[0.3, 0.4, 0.6, 8]} />
              <meshStandardMaterial color={monsterData.color} />
            </mesh>
            {/* Head */}
            <mesh position={[0, 0.7, 0]} castShadow>
              <boxGeometry args={[0.25, 0.25, 0.25]} />
              <meshStandardMaterial color={monsterData.color} />
            </mesh>
            {/* Tusks */}
            <mesh position={[-0.05, 0.6, 0.12]} castShadow>
              <coneGeometry args={[0.02, 0.1, 4]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
            <mesh position={[0.05, 0.6, 0.12]} castShadow>
              <coneGeometry args={[0.02, 0.1, 4]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
          </group>
        );

      case "Дракон":
        return (
          <group>
            {/* Body */}
            <mesh position={[0, 0.4, 0]} castShadow>
              <sphereGeometry args={[0.8, 8, 6]} />
              <meshStandardMaterial color={monsterData.color} />
            </mesh>
            {/* Head */}
            <mesh position={[0, 0.6, 1]} castShadow>
              <coneGeometry args={[0.4, 0.8, 8]} />
              <meshStandardMaterial color={monsterData.color} />
            </mesh>
            {/* Wings */}
            <mesh position={[-0.6, 0.8, -0.2]} rotation={[0, 0, Math.PI / 4]} castShadow>
              <boxGeometry args={[0.05, 1.2, 0.8]} />
              <meshStandardMaterial color={monsterData.color} transparent opacity={0.7} />
            </mesh>
            <mesh position={[0.6, 0.8, -0.2]} rotation={[0, 0, -Math.PI / 4]} castShadow>
              <boxGeometry args={[0.05, 1.2, 0.8]} />
              <meshStandardMaterial color={monsterData.color} transparent opacity={0.7} />
            </mesh>
          </group>
        );

      case "Скелет":
        return (
          <group>
            {/* Body */}
            <mesh position={[0, 0.3, 0]} castShadow>
              <cylinderGeometry args={[0.2, 0.25, 0.5, 8]} />
              <meshStandardMaterial color={monsterData.color} />
            </mesh>
            {/* Head (skull) */}
            <mesh position={[0, 0.6, 0]} castShadow>
              <sphereGeometry args={[0.12, 8, 6]} />
              <meshStandardMaterial color={monsterData.color} />
            </mesh>
            {/* Eye sockets */}
            <mesh position={[-0.05, 0.62, 0.1]} castShadow>
              <sphereGeometry args={[0.02, 4, 4]} />
              <meshStandardMaterial color="#000000" />
            </mesh>
            <mesh position={[0.05, 0.62, 0.1]} castShadow>
              <sphereGeometry args={[0.02, 4, 4]} />
              <meshStandardMaterial color="#000000" />
            </mesh>
          </group>
        );

      case "Волк":
        return (
          <group>
            {/* Body */}
            <mesh position={[0, 0.2, 0]} castShadow>
              <capsuleGeometry args={[0.2, 0.6, 4, 8]} />
              <meshStandardMaterial color={monsterData.color} />
            </mesh>
            {/* Head */}
            <mesh position={[0, 0.3, 0.4]} castShadow>
              <coneGeometry args={[0.15, 0.3, 8]} />
              <meshStandardMaterial color={monsterData.color} />
            </mesh>
            {/* Ears */}
            <mesh position={[-0.08, 0.45, 0.3]} castShadow>
              <coneGeometry args={[0.04, 0.12, 4]} />
              <meshStandardMaterial color={monsterData.color} />
            </mesh>
            <mesh position={[0.08, 0.45, 0.3]} castShadow>
              <coneGeometry args={[0.04, 0.12, 4]} />
              <meshStandardMaterial color={monsterData.color} />
            </mesh>
          </group>
        );

      case "Голем":
        return (
          <group>
            {/* Body */}
            <mesh position={[0, 0.5, 0]} castShadow>
              <boxGeometry args={[0.6, 1.0, 0.4]} />
              <meshStandardMaterial color={monsterData.color} />
            </mesh>
            {/* Head */}
            <mesh position={[0, 1.1, 0]} castShadow>
              <boxGeometry args={[0.4, 0.4, 0.4]} />
              <meshStandardMaterial color={monsterData.color} />
            </mesh>
            {/* Arms */}
            <mesh position={[-0.4, 0.7, 0]} castShadow>
              <boxGeometry args={[0.2, 0.6, 0.2]} />
              <meshStandardMaterial color={monsterData.color} />
            </mesh>
            <mesh position={[0.4, 0.7, 0]} castShadow>
              <boxGeometry args={[0.2, 0.6, 0.2]} />
              <meshStandardMaterial color={monsterData.color} />
            </mesh>
            {/* Crystal in chest */}
            <mesh position={[0, 0.6, 0.25]} castShadow>
              <octahedronGeometry args={[0.08, 0]} />
              <meshStandardMaterial color="#3b82f6" emissive="#1e40af" emissiveIntensity={0.3} />
            </mesh>
          </group>
        );

      default:
        return (
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.3, 0.3, 0.6, 8]} />
            <meshStandardMaterial 
              color={monsterData.color}
              transparent
              opacity={isHovered ? 0.8 : 1.0}
            />
          </mesh>
        );
    }
  };

  return <>{getMonsterGeometry()}</>;
}

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
        // Enhanced fallback geometry based on monster type
        <MonsterFallback monsterData={monsterData} isHovered={isHovered} />
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
      console.log(`📥 Preloading model: ${monster.name} from ${monster.modelPath}`);
    } catch (error) {
      console.warn(`Failed to preload model: ${monster.modelPath}`, error);
    }
  });
}