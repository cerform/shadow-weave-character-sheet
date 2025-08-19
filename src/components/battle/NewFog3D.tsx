import React, { useEffect, useState, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useFogManager } from '@/hooks/useFogManager';
import { useBattle3DControlStore } from '@/stores/battle3DControlStore';
import { createFogTexture, updateFogTexture } from '@/game/fog/FogOfWar3D';

interface NewFog3DProps {
  sessionId: string;
  mapId: string;
  enabled?: boolean;
  opacity?: number;
}

export const NewFog3D: React.FC<NewFog3DProps> = ({
  sessionId,
  mapId,
  enabled = true,
  opacity = 0.8
}) => {
  const { gl, camera } = useThree();
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const [isPainting, setIsPainting] = useState(false);
  
  const { shouldHandleFogInteraction, keysPressed, isMouseDown } = useBattle3DControlStore();
  
  // Создаем менеджер тумана
  const {
    fogManager,
    isInitialized,
    updateCounter,
    revealArea,
    hideArea,
    revealAll,
    hideAll
  } = useFogManager({
    mapSize: 50,
    cellSize: 1,
    sessionId,
    mapId
  });

  // Создаем текстуру тумана
  const fogTexture = useMemo(() => {
    if (!fogManager || !isInitialized) return null;
    
    console.log('🌫️ Creating fog texture, update counter:', updateCounter);
    const texture = createFogTexture(fogManager.getGrid());
    return texture;
  }, [fogManager, isInitialized, updateCounter]);

  // Материал тумана
  const fogMaterial = useMemo(() => {
    if (!fogTexture) return null;
    
    const material = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: opacity,
      alphaMap: fogTexture,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });
    
    material.alphaMap!.wrapS = material.alphaMap!.wrapT = THREE.ClampToEdgeWrapping;
    material.alphaMap!.minFilter = THREE.LinearFilter;
    material.alphaMap!.magFilter = THREE.LinearFilter;
    
    return material;
  }, [fogTexture, opacity]);

  // Обновление текстуры при изменениях
  useEffect(() => {
    if (!fogTexture || !fogManager || !isInitialized) return;
    
    console.log('🌫️ Updating fog texture, update counter:', updateCounter);
    updateFogTexture(fogTexture, fogManager.getGrid());
  }, [fogTexture, fogManager, isInitialized, updateCounter]);

  // Обработка рисования
  const paintFog = (event: PointerEvent) => {
    if (!enabled || !shouldHandleFogInteraction() || !fogManager) return;
    
    event.preventDefault();
    
    const canvas = gl.domElement;
    const rect = canvas.getBoundingClientRect();
    
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    
    // Создаем невидимую плоскость для рейкастинга
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const target = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, target);

    if (target) {
      // Корректируем координаты для карты 50x50 с центром в (0,0)
      const worldX = target.x + 25;
      const worldZ = target.z + 25;
      
      console.log('🌫️ NewFog3D: Painting fog at world coords:', worldX, worldZ, 'keys:', keysPressed);
      
      if (keysPressed.shift) {
        console.log('🌫️ Revealing area at:', worldX, worldZ);
        revealArea(worldX, worldZ, 3);
      } else if (keysPressed.alt) {
        console.log('🌫️ Hiding area at:', worldX, worldZ);
        hideArea(worldX, worldZ, 3);
      }
    }
  };

  // Обработчики событий
  useEffect(() => {
    if (!shouldHandleFogInteraction()) return;

    const canvas = gl.domElement;
    
    const handlePointerDown = (e: PointerEvent) => {
      if (e.button === 0 && (keysPressed.shift || keysPressed.alt)) {
        setIsPainting(true);
        paintFog(e);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (isPainting && (keysPressed.shift || keysPressed.alt)) {
        paintFog(e);
      }
    };

    const handlePointerUp = () => {
      setIsPainting(false);
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [shouldHandleFogInteraction, keysPressed, isPainting, gl.domElement, paintFog, fogManager]);

  // Синхронизация состояния рисования
  useEffect(() => {
    if (!isMouseDown) {
      setIsPainting(false);
    }
  }, [isMouseDown]);

  console.log('🌫️ NewFog3D: Rendering fog, enabled:', enabled, 'material:', !!fogMaterial);

  if (!enabled || !fogMaterial) {
    return null;
  }

  return (
    <mesh 
      rotation-x={-Math.PI / 2} 
      position={[0, 0.02, 0]}
      renderOrder={1000}
    >
      <planeGeometry args={[50, 50, 1, 1]} />
      <primitive attach="material" object={fogMaterial} />
    </mesh>
  );
};