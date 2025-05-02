
import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { createDiceMaterial, createDiceTextTexture } from './DiceMaterial';

interface DiceD6Props {
  rolling?: boolean;
  themeColor?: string;
  size?: number;
  initialRotation?: [number, number, number];
  position?: [number, number, number];
}

export const DiceD6: React.FC<DiceD6Props> = ({
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
    
    // Create 6 faces with numbers (standard dice has opposite faces sum to 7)
    // Order: right, left, top, bottom, front, back
    [1, 6, 2, 5, 3, 4].forEach(num => {
      const material = createDiceMaterial({ themeColor });
      const textTexture = createDiceTextTexture(num.toString(), '#ffffff');
      material.map = textTexture;
      faceMaterials.push(material);
    });
    
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
      <boxGeometry args={[1, 1, 1]} />
      {materials.length === 6 ? (
        <primitive object={new THREE.MeshFaceMaterial(materials)} attach="material" />
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
