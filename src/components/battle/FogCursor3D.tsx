// src/components/battle/FogCursor3D.tsx
import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useUnifiedFogStore } from '@/stores/unifiedFogStore';

export const FogCursor3D: React.FC = () => {
  const { camera, gl, raycaster } = useThree();
  const cursorRef = useRef<THREE.Mesh>(null);
  const mouseRef = useRef(new THREE.Vector2());
  
  const activeMode = useUnifiedFogStore(s => s.activeMode);
  const brushSize = useUnifiedFogStore(s => s.brushSize);

  // Update cursor position on mouse move
  useEffect(() => {
    if (activeMode !== 'fog') return;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    gl.domElement.addEventListener('mousemove', handleMouseMove);
    return () => gl.domElement.removeEventListener('mousemove', handleMouseMove);
  }, [activeMode, gl]);

  // Update cursor position using raycaster
  useFrame(() => {
    if (activeMode !== 'fog' || !cursorRef.current) return;

    raycaster.setFromCamera(mouseRef.current, camera);
    
    // Create a temporary plane at y=0 for intersection
    const tempPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersectPoint = new THREE.Vector3();
    
    if (raycaster.ray.intersectPlane(tempPlane, intersectPoint)) {
      cursorRef.current.position.copy(intersectPoint);
      cursorRef.current.position.y = 0.01; // Slightly above ground
      
      // Scale cursor based on brush size (convert pixels to world units)
      const worldBrushSize = (brushSize / 1200) * 24; // Convert brush size to world scale
      cursorRef.current.scale.set(worldBrushSize, 1, worldBrushSize);
    }
  });

  if (activeMode !== 'fog') return null;

  return (
    <mesh ref={cursorRef} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.5, 32]} />
      <meshBasicMaterial 
        color="#ffff00" 
        transparent 
        opacity={0.3}
        depthWrite={false}
      />
    </mesh>
  );
};