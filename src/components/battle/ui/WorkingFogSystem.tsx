// Рабочая система тумана без сложностей
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useBattle3DControlStore } from '@/stores/battle3DControlStore';

interface WorkingFogSystemProps {
  paintMode: 'reveal' | 'hide';
  brushSize: number;
}

export const WorkingFogSystem: React.FC<WorkingFogSystemProps> = ({ paintMode, brushSize }) => {
  const { scene, camera, gl } = useThree();
  const { 
    isMouseDown, 
    isDragging, 
    keysPressed, 
    shouldHandleFogInteraction 
  } = useBattle3DControlStore();
  const fogTextureRef = useRef<THREE.DataTexture | null>(null);
  const fogMaterialRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const fogPlaneRef = useRef<THREE.Mesh | null>(null);
  
  const MAP_WIDTH = 24;
  const MAP_HEIGHT = 16;
  const TEXTURE_SIZE = 512;

  // Инициализация тумана
  useEffect(() => {
    console.log('🌫️ Initializing fog system');
    
    // Создаем текстуру тумана
    const textureData = new Uint8Array(TEXTURE_SIZE * TEXTURE_SIZE * 4);
    
    // Изначально весь туман (альфа = 255)
    for (let i = 0; i < textureData.length; i += 4) {
      textureData[i] = 0;     // R
      textureData[i + 1] = 0; // G  
      textureData[i + 2] = 0; // B
      textureData[i + 3] = 200; // A - туман
    }
    
    const texture = new THREE.DataTexture(textureData, TEXTURE_SIZE, TEXTURE_SIZE, THREE.RGBAFormat);
    texture.needsUpdate = true;
    texture.flipY = false;
    
    fogTextureRef.current = texture;
    
    // Создаем материал
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.8,
      color: 0x000000,
      side: THREE.DoubleSide
    });
    
    fogMaterialRef.current = material;
    
    // Создаем плоскость тумана
    const geometry = new THREE.PlaneGeometry(MAP_WIDTH, MAP_HEIGHT);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0.01; // Чуть выше карты
    mesh.name = 'fog-layer';
    
    fogPlaneRef.current = mesh;
    scene.add(mesh);
    
    console.log('🌫️ Fog system initialized');
    
    return () => {
      if (fogPlaneRef.current) {
        scene.remove(fogPlaneRef.current);
        console.log('🌫️ Fog system cleaned up');
      }
      if (fogTextureRef.current) {
        fogTextureRef.current.dispose();
      }
      if (fogMaterialRef.current) {
        fogMaterialRef.current.dispose();
      }
    };
  }, [scene]);

  // Функция рисования на текстуре с учетом модификаторов
  const paintFog = useCallback((worldX: number, worldZ: number) => {
    if (!fogTextureRef.current) return;
    
    const texture = fogTextureRef.current;
    const data = texture.image.data as Uint8Array;
    
    // Преобразуем мировые координаты в координаты текстуры
    const texX = Math.floor(((worldX + MAP_WIDTH / 2) / MAP_WIDTH) * TEXTURE_SIZE);
    const texY = Math.floor(((worldZ + MAP_HEIGHT / 2) / MAP_HEIGHT) * TEXTURE_SIZE);
    
    // Размер кисти в пикселях текстуры
    const brushRadius = Math.max(1, brushSize * 10);
    
    // Определяем режим рисования на основе модификаторов
    let actualPaintMode = paintMode;
    if (keysPressed.shift) {
      actualPaintMode = 'hide'; // Shift = добавить туман
    } else if (keysPressed.ctrl) {
      actualPaintMode = 'reveal'; // Ctrl = убрать туман
    }
    
    let changed = false;
    
    for (let dy = -brushRadius; dy <= brushRadius; dy++) {
      for (let dx = -brushRadius; dx <= brushRadius; dx++) {
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= brushRadius) {
          const x = texX + dx;
          const y = texY + dy;
          
          if (x >= 0 && x < TEXTURE_SIZE && y >= 0 && y < TEXTURE_SIZE) {
            const index = (y * TEXTURE_SIZE + x) * 4;
            
            if (actualPaintMode === 'reveal') {
              // Убираем туман (делаем прозрачным)
              if (data[index + 3] > 0) {
                data[index + 3] = 0;
                changed = true;
              }
            } else {
              // Добавляем туман
              if (data[index + 3] < 200) {
                data[index + 3] = 200;
                changed = true;
              }
            }
          }
        }
      }
    }
    
    if (changed) {
      texture.needsUpdate = true;
      console.log(`🖌️ Painted fog at world coords (${worldX.toFixed(1)}, ${worldZ.toFixed(1)}), texture coords (${texX}, ${texY}), mode: ${actualPaintMode}, modifiers: ${JSON.stringify(keysPressed)}`);
    }
  }, [paintMode, brushSize, keysPressed]);

  // Обработка рисования тумана на основе состояния мыши из контроллера
  const previousMouseStateRef = useRef({ isMouseDown: false, isDragging: false });
  
  useEffect(() => {
    // Только если мышь нажата и условия для взаимодействия с туманом выполнены
    if (isMouseDown && shouldHandleFogInteraction()) {
      const canvas = gl.domElement;
      
      // Получаем текущую позицию мыши
      const getMouseWorldPosition = () => {
        // Получаем последнюю позицию мыши из DOM элемента канваса
        const lastMouseX = (canvas as any)._lastMouseX || 0;
        const lastMouseY = (canvas as any)._lastMouseY || 0;
        
        const mouse = new THREE.Vector2(lastMouseX, lastMouseY);
        
        // Создаем рейкастер для пересечения с картой
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        
        // Ищем пересечение с плоскостью карты (y = 0)
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const intersectionPoint = raycaster.ray.intersectPlane(plane, new THREE.Vector3());
        
        return intersectionPoint;
      };
      
      // Рисуем туман при первом нажатии или при перетаскивании
      if (!previousMouseStateRef.current.isMouseDown || isDragging) {
        const worldPos = getMouseWorldPosition();
        if (worldPos) {
          console.log('🖌️ Painting fog at:', worldPos.x, worldPos.z, 'Keys:', keysPressed);
          paintFog(worldPos.x, worldPos.z);
        }
      }
    }
    
    // Обновляем предыдущее состояние
    previousMouseStateRef.current = { isMouseDown, isDragging };
  }, [isMouseDown, isDragging, shouldHandleFogInteraction, gl, camera, paintFog, keysPressed]);

  // Добавляем отслеживание позиции мыши с правильными координатами
  useEffect(() => {
    const canvas = gl.domElement;
    
    const trackMousePosition = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      // Правильные координаты без двойной инверсии
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = (((e.clientY - rect.top) / rect.height) * 2 - 1);
      
      // Сохраняем позицию мыши в DOM элементе для использования в рисовании
      (canvas as any)._lastMouseX = mouseX;
      (canvas as any)._lastMouseY = mouseY;
    };
    
    canvas.addEventListener('mousemove', trackMousePosition);
    canvas.addEventListener('pointerdown', trackMousePosition);
    canvas.addEventListener('pointermove', trackMousePosition);
    
    return () => {
      canvas.removeEventListener('mousemove', trackMousePosition);
      canvas.removeEventListener('pointerdown', trackMousePosition);
      canvas.removeEventListener('pointermove', trackMousePosition);
    };
  }, [gl]);

  // Функции для полной очистки/сокрытия
  const revealAll = useCallback(() => {
    if (!fogTextureRef.current) return;
    
    const texture = fogTextureRef.current;
    const data = texture.image.data as Uint8Array;
    
    // Делаем всю текстуру прозрачной
    for (let i = 3; i < data.length; i += 4) {
      data[i] = 0;
    }
    
    texture.needsUpdate = true;
    console.log('🌞 Revealed all fog');
  }, []);

  const hideAll = useCallback(() => {
    if (!fogTextureRef.current) return;
    
    const texture = fogTextureRef.current;
    const data = texture.image.data as Uint8Array;
    
    // Делаем всю текстуру непрозрачной
    for (let i = 3; i < data.length; i += 4) {
      data[i] = 200;
    }
    
    texture.needsUpdate = true;
    console.log('🌫️ Hidden all with fog');
  }, []);

  // Экспортируем функции для использования в UI
  useEffect(() => {
    (window as any).fogControls = {
      revealAll,
      hideAll
    };
    
    return () => {
      delete (window as any).fogControls;
    };
  }, [revealAll, hideAll]);

  return null;
};