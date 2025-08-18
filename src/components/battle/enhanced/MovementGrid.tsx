import React from 'react';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

interface MovementGridProps {
  center: [number, number, number];
  radius: number;
  visible: boolean;
}

export const MovementGrid: React.FC<MovementGridProps> = ({ center, radius, visible }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current && visible) {
      // Gentle pulsing animation
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.1 + 0.9;
      groupRef.current.scale.setScalar(pulse);
    }
  });

  if (!visible) return null;

  const tiles: JSX.Element[] = [];
  
  // Generate grid tiles in a diamond pattern
  for (let x = -radius; x <= radius; x++) {
    for (let z = -radius; z <= radius; z++) {
      const distance = Math.abs(x) + Math.abs(z);
      if (distance <= radius && distance > 0) {
        const opacity = 1 - (distance / radius) * 0.5; // Fade out towards edges
        
        tiles.push(
          <mesh
            key={`${x}-${z}`}
            position={[center[0] + x, 0.01, center[2] + z]}
          >
            <planeGeometry args={[0.9, 0.9]} />
            <meshBasicMaterial
              color="#22c55e"
              transparent
              opacity={opacity * 0.4}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
        
        // Add border rings
        tiles.push(
          <mesh
            key={`border-${x}-${z}`}
            position={[center[0] + x, 0.02, center[2] + z]}
          >
            <ringGeometry args={[0.4, 0.45, 16]} />
            <meshBasicMaterial
              color="#22c55e"
              transparent
              opacity={opacity * 0.8}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      }
    }
  }

  return (
    <group ref={groupRef}>
      {tiles}
    </group>
  );
};