// src/hooks/useFogPainting.ts
import { useCallback, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useFogStore } from '@/stores/fogStore';

interface FogPaintingOptions {
  mode: 'reveal' | 'hide';
  brushSize: number;
  mapId?: string;
  tileSize?: number;
}

export function useFogPainting({
  mode,
  brushSize,
  mapId = 'main-map',
  tileSize = 5
}: FogPaintingOptions) {
  const { scene, camera, raycaster, pointer } = useThree();
  const isDrawingRef = useRef(false);

  const handlePointerDown = useCallback((event: PointerEvent) => {
    event.preventDefault();
    isDrawingRef.current = true;
    paintAtPointer();
  }, []);

  const handlePointerMove = useCallback((event: PointerEvent) => {
    if (!isDrawingRef.current) return;
    event.preventDefault();
    paintAtPointer();
  }, []);

  const handlePointerUp = useCallback(() => {
    isDrawingRef.current = false;
  }, []);

  const paintAtPointer = useCallback(() => {
    // Обновляем позицию указателя
    raycaster.setFromCamera(pointer, camera);
    
    // Ищем пересечение с плоскостью карты (y = 0)
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersectPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersectPoint);
    
    if (intersectPoint) {
      // Конвертируем мировые координаты в координаты сетки
      const gridX = Math.floor(intersectPoint.x / tileSize);
      const gridZ = Math.floor(intersectPoint.z / tileSize);
      
      console.log(`Painting at grid coordinates: (${gridX}, ${gridZ}) in ${mode} mode`);
      
      if (mode === 'reveal') {
        useFogStore.getState().reveal(mapId, gridX, gridZ, brushSize);
      } else {
        // Скрываем область
        const { maps, size } = useFogStore.getState();
        const map = maps[mapId];
        if (!map) return;
        
        const newMap = new Uint8Array(map);
        const width = size.w;
        
        for (let dy = -brushSize; dy <= brushSize; dy++) {
          for (let dx = -brushSize; dx <= brushSize; dx++) {
            if (dx * dx + dy * dy <= brushSize * brushSize) {
              const px = gridX + dx;
              const py = gridZ + dy;
              if (px >= 0 && px < width && py >= 0 && py < size.h) {
                newMap[py * width + px] = 0; // 0 = туман
              }
            }
          }
        }
        
        useFogStore.getState().setMap(mapId, newMap, size.w, size.h);
      }
    }
  }, [mode, brushSize, mapId, tileSize, raycaster, pointer, camera]);

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    isDrawing: isDrawingRef.current
  };
}