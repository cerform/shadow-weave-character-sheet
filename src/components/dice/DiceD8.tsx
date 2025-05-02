
import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { createDiceMaterial, createDiceTextTexture } from './DiceMaterial';

interface DiceD8Props {
  rolling?: boolean;
  themeColor?: string;
  size?: number;
  initialRotation?: [number, number, number];
  position?: [number, number, number];
}

export const DiceD8: React.FC<DiceD8Props> = ({
  rolling = false,
  themeColor = '#8B5CF6',
  size = 1,
  initialRotation = [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
  position = [0, 0, 0]
}) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [materials, setMaterials] = useState<THREE.MeshPhongMaterial[]>([]);
  const rotationSpeedRef = useRef({
    x: Math.random() * 0.02 - 0.01,
    y: Math.random() * 0.02 - 0.01,
    z: Math.random() * 0.02 - 0.01
  });
  
  // When rolling state changes, update rotation speed
  useEffect(() => {
    if (rolling) {
      rotationSpeedRef.current = {
        x: Math.random() * 0.2 - 0.1,
        y: Math.random() * 0.2 - 0.1,
        z: Math.random() * 0.2 - 0.1
      };
    } else {
      // Slow down when not rolling
      rotationSpeedRef.current = {
        x: Math.random() * 0.01 - 0.005,
        y: Math.random() * 0.01 - 0.005,
        z: Math.random() * 0.01 - 0.005
      };
    }
  }, [rolling]);
  
  // Generate materials for each face with number
  useEffect(() => {
    const faceMaterials: THREE.MeshPhongMaterial[] = [];
    
    // Create 8 faces with numbers
    for (let i = 0; i < 8; i++) {
      const material = createDiceMaterial({ themeColor });
      const textTexture = createDiceTextTexture((i + 1).toString(), '#ffffff');
      material.map = textTexture;
      faceMaterials.push(material);
    }
    
    setMaterials(faceMaterials);
  }, [themeColor]);
  
  useFrame(() => {
    if (meshRef.current) {
      // Apply constant rotation
      meshRef.current.rotation.x += rotationSpeedRef.current.x;
      meshRef.current.rotation.y += rotationSpeedRef.current.y;
      meshRef.current.rotation.z += rotationSpeedRef.current.z;
    }
  });
  
  return (
    <mesh 
      ref={meshRef}
      position={position}
      rotation={initialRotation}
      scale={[size, size, size]}
    >
      <octahedronGeometry args={[1, 0]} />
      {materials.length === 8 ? (
        materials.map((material, i) => (
          <primitive key={i} object={material} attach={`material-${i}`} />
        ))
      ) : (
        <meshPhongMaterial 
          color={themeColor} 
          shininess={100} 
          flatShading={true}
        />
      )}
    </mesh>
  );
};
