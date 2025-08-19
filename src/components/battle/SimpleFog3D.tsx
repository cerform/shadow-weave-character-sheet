import React, { useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useFogOfWarStore } from '@/stores/fogOfWarStore';
import { useBattle3DControlStore } from '@/stores/battle3DControlStore';
import { useFogTexture } from '@/hooks/useFogTexture';
import FogPlane3D from './FogPlane3D';

interface SimpleFog3DProps {
  sessionId: string;
  mapId: string;
}

export const SimpleFog3D: React.FC<SimpleFog3DProps> = ({
  sessionId,
  mapId
}) => {
  const { gl, camera } = useThree();
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const [isPainting, setIsPainting] = useState(false);
  
  const { 
    fogSettings, 
    drawVisibleArea, 
    hideVisibleArea,
    loadFogFromDatabase,
    saveFogToDatabase,
    visibleAreas
  } = useFogOfWarStore();
  
  const { shouldHandleFogInteraction, keysPressed, isMouseDown } = useBattle3DControlStore();
  
  // Создаем динамическую текстуру тумана
  const fogTexture = useFogTexture();

  // Загружаем туман из базы при инициализации
  useEffect(() => {
    console.log('🌫️ SimpleFog3D: Loading fog data for session:', sessionId, 'map:', mapId);
    loadFogFromDatabase(sessionId, mapId);
  }, [sessionId, mapId, loadFogFromDatabase]);

  // Автосохранение
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveFogToDatabase(sessionId, mapId);
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [visibleAreas, sessionId, mapId, saveFogToDatabase]);

  // Обработка рисования
  const paintFog = (event: PointerEvent) => {
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
      // Конвертируем координаты в систему карты
      const worldX = target.x + 25;
      const worldY = target.z + 25;
      
      console.log('🌫️ SimpleFog3D: Painting fog at world coords:', worldX, worldY);
      
      if (keysPressed.shift) {
        console.log('🌫️ Revealing area');
        drawVisibleArea(worldX, worldY);
      } else if (keysPressed.alt) {
        console.log('🌫️ Hiding area');
        hideVisibleArea(worldX, worldY);
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
  }, [shouldHandleFogInteraction, keysPressed, isPainting, gl.domElement, paintFog]);

  // Синхронизация состояния рисования
  useEffect(() => {
    if (!isMouseDown) {
      setIsPainting(false);
    }
  }, [isMouseDown]);

  console.log('🌫️ SimpleFog3D: Rendering fog with texture:', !!fogTexture);

  return <FogPlane3D alphaTex={fogTexture} />;
};