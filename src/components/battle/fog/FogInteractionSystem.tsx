// Система взаимодействия с туманом
import React, { useRef, useEffect, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { FogPaintSystem } from '@/systems/fog/FogPaintSystem';
import { MouseInputSystem } from '@/systems/input/MouseInputSystem';
import { interactionManager, InteractionMode } from '@/systems/interaction/InteractionModeManager';

interface FogInteractionSystemProps {
  brushSize: number;
  paintMode: 'reveal' | 'hide';
  sessionId?: string;
  mapId?: string;
}

export const FogInteractionSystem: React.FC<FogInteractionSystemProps> = ({ 
  brushSize, 
  paintMode,
  sessionId = 'default-session',
  mapId = 'main-map'
}) => {
  const { scene, camera, gl } = useThree();
  const fogPaintSystemRef = useRef<FogPaintSystem | null>(null);
  const mouseInputSystemRef = useRef<MouseInputSystem | null>(null);
  const fogPlaneRef = useRef<THREE.Mesh | null>(null);
  const isCurrentlyPainting = useRef(false);

  const MAP_WIDTH = 24;
  const MAP_HEIGHT = 16;
  const TEXTURE_SIZE = 512;

  // Инициализация системы рисования тумана
  useEffect(() => {
    console.log('🌫️ Initializing fog interaction system');
    
    const fogPaintSystem = new FogPaintSystem({
      brushSize,
      paintMode,
      textureSize: TEXTURE_SIZE,
      mapWidth: MAP_WIDTH,
      mapHeight: MAP_HEIGHT,
      sessionId,
      mapId
    });

    fogPaintSystemRef.current = fogPaintSystem;

    // Создаем материал и плоскость тумана
    const texture = fogPaintSystem.getTexture();
    if (texture) {
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.8,
        color: 0x000000,
        side: THREE.DoubleSide
      });

      const geometry = new THREE.PlaneGeometry(MAP_WIDTH, MAP_HEIGHT);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.y = 0.01;
      mesh.name = 'fog-layer';

      fogPlaneRef.current = mesh;
      scene.add(mesh);
    }

    return () => {
      if (fogPlaneRef.current) {
        scene.remove(fogPlaneRef.current);
      }
      fogPaintSystem.dispose();
    };
  }, [scene]);

  // Инициализация системы ввода мыши
  useEffect(() => {
    const canvas = gl.domElement;
    const mouseInputSystem = new MouseInputSystem(canvas, camera);
    mouseInputSystemRef.current = mouseInputSystem;

    const unsubscribe = mouseInputSystem.subscribe((mouseState) => {
      // Рисуем туман только в режиме FOG
      if (interactionManager.isCurrentMode(InteractionMode.FOG)) {
        const shouldPaint = mouseState.isDown && mouseState.worldPosition;
        
        if (shouldPaint) {
          if (fogPaintSystemRef.current && mouseState.worldPosition) {
            fogPaintSystemRef.current.paint(
              mouseState.worldPosition.x,
              mouseState.worldPosition.z,
              paintMode
            );
          }
        }
      }
    });

    return () => {
      unsubscribe();
      mouseInputSystem.dispose();
    };
  }, [gl, camera, paintMode]);

  // Обновление конфигурации системы рисования
  useEffect(() => {
    if (fogPaintSystemRef.current) {
      fogPaintSystemRef.current.updateConfig({ brushSize, paintMode });
    }
  }, [brushSize, paintMode]);

  // Функции для полной очистки/сокрытия
  const revealAll = useCallback(() => {
    if (fogPaintSystemRef.current) {
      fogPaintSystemRef.current.revealAll();
      console.log('🌞 Revealed all fog');
    }
  }, []);

  const hideAll = useCallback(() => {
    if (fogPaintSystemRef.current) {
      fogPaintSystemRef.current.hideAll();
      console.log('🌫️ Hidden all with fog');
    }
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