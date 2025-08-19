// src/components/battle/Fog3DInteractor.tsx
import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useUnifiedFogStore } from '@/stores/unifiedFogStore';

export const Fog3DInteractor: React.FC = () => {
  const { camera, gl, raycaster } = useThree();
  const planeRef = useRef<THREE.Mesh>(null);
  const mouseRef = useRef(new THREE.Vector2());
  const isDrawingRef = useRef(false);
  
  const {
    activeMode,
    brushSize,
    isDrawing,
    setIsDrawing,
    revealArea,
    hideArea
  } = useUnifiedFogStore();

  // Create invisible interaction plane
  useEffect(() => {
    if (planeRef.current) {
      planeRef.current.visible = false; // Make it invisible but still interactive
    }
  }, []);

  // Handle mouse/touch events
  useEffect(() => {
    if (activeMode !== 'fog') return;

    const handlePointerDown = (event: PointerEvent) => {
      event.preventDefault();
      isDrawingRef.current = true;
      setIsDrawing(true);
      updateMouse(event);
      handleDraw(event);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!isDrawingRef.current) return;
      event.preventDefault();
      updateMouse(event);
      handleDraw(event);
    };

    const handlePointerUp = (event: PointerEvent) => {
      event.preventDefault();
      isDrawingRef.current = false;
      setIsDrawing(false);
    };

    const updateMouse = (event: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const handleDraw = (event: PointerEvent) => {
      if (!planeRef.current) return;

      raycaster.setFromCamera(mouseRef.current, camera);
      const intersects = raycaster.intersectObject(planeRef.current);

      if (intersects.length > 0) {
        const point = intersects[0].point;
        
        // Convert 3D world coordinates to 2D map coordinates
        const mapX = ((point.x + 12) / 24) * 1200; // Convert from [-12, 12] to [0, 1200]
        const mapY = ((point.z + 8) / 16) * 800;   // Convert from [-8, 8] to [0, 800]
        
        console.log('🌫️ Drawing at 3D:', { x: point.x, z: point.z }, 'Map:', { x: mapX, y: mapY });

        // Draw based on mode (reveal with LMB, hide with Shift+LMB)
        if (event.shiftKey) {
          hideArea(mapX, mapY, brushSize);
        } else {
          revealArea(mapX, mapY, brushSize);
        }
      }
    };

    if (activeMode === 'fog') {
      gl.domElement.addEventListener('pointerdown', handlePointerDown);
      gl.domElement.addEventListener('pointermove', handlePointerMove);
      gl.domElement.addEventListener('pointerup', handlePointerUp);
      gl.domElement.addEventListener('pointerleave', handlePointerUp);

      return () => {
        gl.domElement.removeEventListener('pointerdown', handlePointerDown);
        gl.domElement.removeEventListener('pointermove', handlePointerMove);
        gl.domElement.removeEventListener('pointerup', handlePointerUp);
        gl.domElement.removeEventListener('pointerleave', handlePointerUp);
      };
    }
  }, [activeMode, camera, gl, raycaster, brushSize, revealArea, hideArea, setIsDrawing]);

  return (
    <mesh 
      ref={planeRef}
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, 0.01, 0]}
    >
      <planeGeometry args={[24, 16]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
};