import React, { useState, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Универсальный хук для перетаскивания 3D объектов
 * Используется как для токенов, так и для ассетов
 */
export const useDraggable3D = (
  canMove: boolean,
  onMove?: (mapX: number, mapY: number) => void,
  onDragChange?: (dragging: boolean) => void,
  onSelect?: () => void
) => {
  const [isDragging, setIsDragging] = useState(false);
  const { camera, gl } = useThree();
  const groupRef = useRef<THREE.Group>(null);

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    onSelect?.();
    
    if (canMove) {
      setIsDragging(true);
      gl.domElement.style.cursor = 'grabbing';
      onDragChange?.(true);
      console.log('🎯 Started dragging object');
    }
  };

  const handlePointerEnter = () => {
    if (canMove && !isDragging) {
      gl.domElement.style.cursor = 'grab';
    }
  };

  const handlePointerLeave = () => {
    if (!isDragging) {
      gl.domElement.style.cursor = 'default';
    }
  };

  // Обработка событий мыши на уровне документа для плавного перетаскивания
  React.useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!groupRef.current) return;

      const rect = gl.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersectionPoint = new THREE.Vector3();
      
      if (raycaster.ray.intersectPlane(plane, intersectionPoint)) {
        // Ограничиваем движение в пределах карты (-12 до +12 по X, -8 до +8 по Z)
        const boundedX = Math.max(-12, Math.min(12, intersectionPoint.x));
        const boundedZ = Math.max(-8, Math.min(8, intersectionPoint.z));
        
        // Обновляем позицию объекта в реальном времени
        groupRef.current.position.x = boundedX;
        groupRef.current.position.z = boundedZ;
        
        console.log('🏃 Dragging object to:', { x: boundedX, z: boundedZ });
      }
    };

    const handleMouseUp = () => {
      console.log('🎯 Finished dragging object');
      setIsDragging(false);
      gl.domElement.style.cursor = 'default';
      onDragChange?.(false);
      
      if (groupRef.current && onMove) {
        const newPos = groupRef.current.position;
        
        // Конвертируем 3D координаты обратно в 2D координаты карты (0-1200 x 0-800)
        const mapX = ((newPos.x + 12) / 24) * 1200;
        const mapY = ((-newPos.z + 8) / 16) * 800;
        
        // Ограничиваем границами карты
        const boundedMapX = Math.max(0, Math.min(1200, mapX));
        const boundedMapY = Math.max(0, Math.min(800, mapY));
        
        console.log('📍 Final position:', { 
          mapX: boundedMapX, 
          mapY: boundedMapY,
          from3D: { x: newPos.x, z: newPos.z }
        });
        
        onMove(boundedMapX, boundedMapY);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, camera, gl.domElement, onMove, onDragChange]);

  return {
    groupRef,
    isDragging,
    handlePointerDown,
    handlePointerEnter,
    handlePointerLeave,
  };
};