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
      
      // Создаем плоскость на уровне Y=0 для более точного пересечения
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersectionPoint = new THREE.Vector3();
      
      if (raycaster.ray.intersectPlane(plane, intersectionPoint)) {
        // Ограничиваем движение в пределах карты (расширяем границы)
        const boundedX = Math.max(-25, Math.min(25, intersectionPoint.x));
        const boundedZ = Math.max(-25, Math.min(25, intersectionPoint.z));
        
        // Обновляем позицию объекта в реальном времени, сохраняя Y
        const currentY = groupRef.current.position.y;
        groupRef.current.position.x = boundedX;
        groupRef.current.position.z = boundedZ;
        groupRef.current.position.y = currentY; // Сохраняем Y координату
        
        console.log('🏃 Dragging object to:', { x: boundedX, z: boundedZ, y: currentY });
      }
    };

    const handleMouseUp = () => {
      console.log('🎯 Finished dragging object');
      setIsDragging(false);
      gl.domElement.style.cursor = 'default';
      onDragChange?.(false);
      
      if (groupRef.current && onMove) {
        const newPos = groupRef.current.position;
        
        console.log('📍 Final position:', { 
          x: newPos.x, 
          z: newPos.z,
          y: newPos.y
        });
        
        // Вызываем callback с 3D координатами (X и Z)
        onMove(newPos.x, newPos.z);
      }
    };

    // Предотвращаем выделение текста во время перетаскивания
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.body.style.userSelect = '';
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