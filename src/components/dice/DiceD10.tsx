
import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { createDiceMaterial, createDiceTextTexture } from './DiceMaterial';

// Custom geometry for d10 (Pentagonal trapezohedron)
const createD10Geometry = () => {
  // Create a custom pentagonal trapezohedron geometry for d10
  const geometry = new THREE.BufferGeometry();
  
  // Define vertices for pentagonal trapezohedron
  const vertices = [];
  
  // Top point
  vertices.push(0, 1, 0);
  
  // Top pentagon points
  for (let i = 0; i < 5; i++) {
    const angle = (Math.PI * 2 / 5) * i;
    vertices.push(
      0.6 * Math.cos(angle),
      0.2,
      0.6 * Math.sin(angle)
    );
  }
  
  // Bottom pentagon points (rotated 36 degrees from top)
  for (let i = 0; i < 5; i++) {
    const angle = (Math.PI * 2 / 5) * (i + 0.5);
    vertices.push(
      0.6 * Math.cos(angle),
      -0.2,
      0.6 * Math.sin(angle)
    );
  }
  
  // Bottom point
  vertices.push(0, -1, 0);
  
  // Define faces (indices)
  const indices = [];
  
  // Top 5 faces
  for (let i = 0; i < 5; i++) {
    const nextTop = (i + 1) % 5;
    indices.push(0, i + 1, nextTop + 1); // Top center to top pentagon
    
    // Side faces connecting top and bottom pentagons
    indices.push(i + 1, i + 6, nextTop + 1);
    indices.push(nextTop + 1, i + 6, nextTop + 6);
  }
  
  // Bottom 5 faces
  for (let i = 0; i < 5; i++) {
    const nextBottom = (i + 1) % 5;
    indices.push(11, i + 6, nextBottom + 6); // Bottom center to bottom pentagon
  }
  
  // Create the geometry
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  
  return geometry;
};

interface DiceD10Props {
  rolling?: boolean;
  themeColor?: string;
  size?: number;
  initialRotation?: [number, number, number];
  position?: [number, number, number];
}

export const DiceD10: React.FC<DiceD10Props> = ({
  rolling = false,
  themeColor = '#8B5CF6',
  size = 1,
  initialRotation = [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
  position = [0, 0, 0]
}) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [materials, setMaterials] = useState<THREE.MeshPhongMaterial[]>([]);
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const rotationSpeedRef = useRef({
    x: Math.random() * 0.02 - 0.01,
    y: Math.random() * 0.02 - 0.01,
    z: Math.random() * 0.02 - 0.01
  });
  
  // Create D10 geometry on mount
  useEffect(() => {
    setGeometry(createD10Geometry());
  }, []);
  
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
    
    // Create 10 faces with numbers
    for (let i = 0; i < 10; i++) {
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
  
  // If we don't have the geometry yet, render nothing
  if (!geometry) {
    return null;
  }
  
  return (
    <mesh 
      ref={meshRef}
      position={position}
      rotation={initialRotation}
      scale={[size, size, size]}
      geometry={geometry}
    >
      {materials.length === 10 ? (
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
