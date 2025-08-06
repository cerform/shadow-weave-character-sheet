// src/components/battle/FogOfWarLayer.tsx

import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FogOfWarLayerProps {
  width: number;
  height: number;
  resolution: number;
  isDM: boolean;
  revealBrushSize?: number;
}

const FogOfWarLayer: React.FC<FogOfWarLayerProps> = ({
  width,
  height,
  resolution,
  isDM,
  revealBrushSize = 2,
}) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [fogTexture] = useState(() => {
    const size = resolution * resolution;
    const data = new Uint8Array(size).fill(255); // full fog initially
    const texture = new THREE.DataTexture(data, resolution, resolution, THREE.RedFormat);
    texture.needsUpdate = true;
    return texture;
  });

  const worldToTex = (x: number, z: number) => {
    const u = Math.floor(((x + width / 2) / width) * resolution);
    const v = Math.floor(((z + height / 2) / height) * resolution);
    return { u, v };
  };

  const reveal = (x: number, z: number) => {
    const { u, v } = worldToTex(x, z);
    const radius = Math.floor(revealBrushSize);
    const data = fogTexture.image.data;

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const uu = u + dx;
        const vv = v + dy;
        if (uu >= 0 && uu < resolution && vv >= 0 && vv < resolution) {
          const idx = vv * resolution + uu;
          data[idx] = 0; // clear fog
        }
      }
    }

    fogTexture.needsUpdate = true;
  };

  const [isRevealing, setIsRevealing] = useState(false);

  useFrame(({ mouse, camera, gl }) => {
    if (!isDM || !meshRef.current) return;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(meshRef.current);
    
    if (intersects.length > 0 && isRevealing) {
      const { x, z } = intersects[0].point;
      reveal(x, z);
    }
  });

  const handlePointerDown = () => {
    setIsRevealing(true);
  };

  const handlePointerUp = () => {
    setIsRevealing(false);
  };

  // Для DM туман войны невидим, для игроков - видим
  if (isDM) return null;

  return (
    <mesh 
      ref={meshRef} 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, 0.02, 0]}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        map={fogTexture}
        transparent
        opacity={0.85}
        color="black"
      />
    </mesh>
  );
};

export default FogOfWarLayer;