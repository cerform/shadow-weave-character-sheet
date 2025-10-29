// src/hooks/useFogPainting.ts
import { useCallback, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useFogStore } from '@/stores/fogStore';
import { supabase } from '@/integrations/supabase/client';

interface FogPaintingOptions {
  mode: 'reveal' | 'hide';
  brushSize: number;
  mapId?: string;
  tileSize?: number;
  sessionId: string; // Добавляем sessionId для синхронизации
}

export function useFogPainting({
  mode,
  brushSize,
  mapId = 'main-map',
  tileSize = 5,
  sessionId
}: FogPaintingOptions) {
  const { scene, camera, raycaster, pointer } = useThree();
  const isDrawingRef = useRef(false);
  
  // Функция для синхронизации с Supabase
  const syncFogToDatabase = useCallback(async (gridX: number, gridZ: number, isRevealed: boolean) => {
    try {
      const { error } = await supabase
        .from('fog_of_war')
        .upsert({
          session_id: sessionId,
          map_id: mapId,
          grid_x: gridX,
          grid_y: gridZ,
          is_revealed: isRevealed
        }, {
          onConflict: 'session_id,map_id,grid_x,grid_y'
        });
      
      if (error) {
        console.error('Error syncing fog to database:', error);
      }
    } catch (error) {
      console.error('Error in syncFogToDatabase:', error);
    }
  }, [sessionId, mapId]);

  const handlePointerDown = useCallback((event: PointerEvent) => {
    event.preventDefault();
    isDrawingRef.current = true;
    paintAtPointer(event);
  }, []);

  const handlePointerMove = useCallback((event: PointerEvent) => {
    if (!isDrawingRef.current) return;
    event.preventDefault();
    paintAtPointer(event);
  }, []);

  const handlePointerUp = useCallback(() => {
    isDrawingRef.current = false;
  }, []);

  const paintAtPointer = useCallback((event?: PointerEvent) => {
    // Определяем режим рисования на основе модификаторов клавиш
    let currentMode = mode;
    if (event) {
      if (event.ctrlKey) {
        currentMode = 'hide'; // Ctrl = скрывать (добавлять туман)
      } else if (event.altKey) {
        currentMode = 'reveal'; // Alt = показывать (убирать туман)
      }
    }

    // Обновляем позицию указателя
    raycaster.setFromCamera(pointer, camera);
    
    // Ищем пересечение с плоскостью карты (y = 0)
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersectPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersectPoint);
    
    if (intersectPoint) {
      // GridHelper создает сетку 24x24 от -12 до +12
      // Нужно правильно преобразовать мировые координаты в индексы сетки
      const gridX = Math.floor(intersectPoint.x + 12); // [-12,12] -> [0,24]
      const gridZ = Math.floor(intersectPoint.z + 12); // [-12,12] -> [0,24]
      
      // Проверяем границы сетки (0-23 включительно)
      const { size } = useFogStore.getState();
      if (gridX < 0 || gridX >= size.w || gridZ < 0 || gridZ >= size.h) {
        console.log(`Координаты вне границ: (${gridX}, ${gridZ}), размер сетки: ${size.w}x${size.h}`);
        return; // Вне границ сетки
      }
      
      const modeText = currentMode === 'reveal' ? 'открытие' : 'скрытие';
      const keyText = event?.ctrlKey ? ' (Ctrl)' : event?.altKey ? ' (Alt)' : '';
      console.log(`Рисование в режиме ${modeText}${keyText} на координатах: (${gridX}, ${gridZ}), мировые: (${intersectPoint.x.toFixed(2)}, ${intersectPoint.z.toFixed(2)})`);
      
      if (currentMode === 'reveal') {
        useFogStore.getState().reveal(mapId, gridX, gridZ, brushSize);
        
        // Синхронизируем с базой данных
        for (let dy = -brushSize; dy <= brushSize; dy++) {
          for (let dx = -brushSize; dx <= brushSize; dx++) {
            if (dx * dx + dy * dy <= brushSize * brushSize) {
              const px = gridX + dx;
              const py = gridZ + dy;
              if (px >= 0 && px < size.w && py >= 0 && py < size.h) {
                syncFogToDatabase(px, py, true); // Открываем клетку
              }
            }
          }
        }
      } else {
        // Скрываем область (добавляем туман)
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
                newMap[py * width + px] = 0; // 0 = туман (скрыто)
                syncFogToDatabase(px, py, false); // Скрываем клетку
              }
            }
          }
        }
        
        useFogStore.getState().setMap(mapId, newMap, size.w, size.h);
      }
    }
  }, [mode, brushSize, mapId, tileSize, raycaster, pointer, camera, syncFogToDatabase]);

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    isDrawing: isDrawingRef.current
  };
}