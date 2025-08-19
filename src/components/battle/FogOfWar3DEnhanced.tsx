import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { supabase } from '@/integrations/supabase/client';
import { useFogOfWarStore } from '@/stores/fogOfWarStore';
import { useBattle3DControlStore } from '@/stores/battle3DControlStore';

interface FogCell {
  id: string;
  grid_x: number;
  grid_y: number;
  is_revealed: boolean;
}

interface FogOfWar3DEnhancedProps {
  sessionId: string;
  mapId: string;
  mapSize: { width: number; height: number };
  gridSize: number;
  isDM: boolean;
  brushSize?: number;
  onFogUpdate?: (cells: FogCell[]) => void;
}

export const FogOfWar3DEnhanced: React.FC<FogOfWar3DEnhancedProps> = ({
  sessionId,
  mapId,
  mapSize,
  gridSize,
  isDM,
  brushSize = 3,
  onFogUpdate
}) => {
  // Используем общий store для синхронизации с 2D
  const { 
    visibleAreas, 
    fogSettings, 
    drawVisibleArea, 
    hideVisibleArea,
    loadFogFromDatabase,
    saveFogToDatabase
  } = useFogOfWarStore();
  const { gl, camera, scene } = useThree();
  const [isPainting, setIsPainting] = useState(false);
  const [paintMode, setPaintMode] = useState<'reveal' | 'hide'>('reveal');
  
  // Generate a proper map ID if one isn't provided
  const actualMapId = useMemo(() => {
    if (!mapId || mapId === 'current-map') {
      return `map_${sessionId}_${Date.now()}`;
    }
    return mapId;
  }, [mapId, sessionId]);
  
  const fogGeometry = useRef<THREE.PlaneGeometry>();
  const fogMaterial = useRef<THREE.ShaderMaterial>();
  const fogMesh = useRef<THREE.Mesh>();
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  // Grid dimensions
  const gridWidth = Math.ceil(mapSize.width / gridSize);
  const gridHeight = Math.ceil(mapSize.height / gridSize);

  // Загружаем туман из базы данных при инициализации
  useEffect(() => {
    loadFogFromDatabase(sessionId, actualMapId);
  }, [sessionId, actualMapId, loadFogFromDatabase]);

  // Автосохранение изменений в базу данных
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveFogToDatabase(sessionId, actualMapId);
    }, 1000); // Сохраняем через 1 секунду после последнего изменения

    return () => clearTimeout(timeoutId);
  }, [visibleAreas, sessionId, actualMapId, saveFogToDatabase]);

  // Create fog texture based on visible areas from store
  const fogTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = gridWidth;
    canvas.height = gridHeight;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return null;

    // Fill with black (hidden)
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, gridWidth, gridHeight);

    // Draw revealed areas in white
    ctx.fillStyle = 'white';
    visibleAreas.forEach(area => {
      if (area.type === 'circle') {
        const centerX = (area.x / mapSize.width) * gridWidth;
        const centerY = (area.y / mapSize.height) * gridHeight;
        const radius = (area.radius / Math.min(mapSize.width, mapSize.height)) * Math.min(gridWidth, gridHeight);
        
        // Рисуем круг
        for (let x = Math.max(0, Math.floor(centerX - radius)); x <= Math.min(gridWidth - 1, Math.ceil(centerX + radius)); x++) {
          for (let y = Math.max(0, Math.floor(centerY - radius)); y <= Math.min(gridHeight - 1, Math.ceil(centerY + radius)); y++) {
            const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
            if (distance <= radius) {
              ctx.fillRect(x, y, 1, 1);
            }
          }
        }
      }
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    
    return texture;
  }, [visibleAreas, gridWidth, gridHeight, mapSize]);

  // Create fog shader material
  const fogShaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        fogTexture: { value: fogTexture },
        fogColor: { value: new THREE.Color(0x000000) },
        fogOpacity: { value: isDM ? 0.4 : 0.95 }, // DM видит туман полупрозрачным для редактирования
        time: { value: 0 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D fogTexture;
        uniform vec3 fogColor;
        uniform float fogOpacity;
        uniform float time;
        varying vec2 vUv;
        
        float noise(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }
        
        void main() {
          float revealed = texture2D(fogTexture, vUv).r;
          
          // Add some animated noise for atmospheric effect
          float n = noise(vUv * 20.0 + time * 0.5) * 0.1;
          float alpha = (1.0 - revealed) * fogOpacity + n;
          
          // Smooth edges
          float edge = smoothstep(0.0, 0.1, revealed) * smoothstep(1.0, 0.9, revealed);
          alpha *= (1.0 - edge * 0.5);
          
          gl_FragColor = vec4(fogColor, alpha);
        }
      `
    });
  }, [fogTexture, isDM]);

  // Update shader uniform
  useFrame((state) => {
    if (fogShaderMaterial) {
      fogShaderMaterial.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  const { shouldHandleFogInteraction, keysPressed, isMouseDown } = useBattle3DControlStore();

  // Handle mouse interactions for DM painting
  const handlePointerDown = (event: PointerEvent) => {
    if (!isDM || !shouldHandleFogInteraction()) return;
    
    event.preventDefault();
    event.stopPropagation();
    setIsPainting(true);
    
    // Determine paint mode based on modifier keys
    if (keysPressed.shift) {
      setPaintMode('reveal');
    } else if (keysPressed.alt) {
      setPaintMode('hide');
    }
    
    paintFog(event);
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (!isDM || !isPainting || !shouldHandleFogInteraction()) return;
    
    event.preventDefault();
    event.stopPropagation();
    paintFog(event);
  };

  const handlePointerUp = () => {
    setIsPainting(false);
  };

  // Синхронизируем состояние рисования с центральным стором
  useEffect(() => {
    if (!isMouseDown) {
      setIsPainting(false);
    }
  }, [isMouseDown]);

  const paintFog = async (event: PointerEvent) => {
    if (!isDM || !fogMesh.current) return;

    const canvas = gl.domElement;
    const rect = canvas.getBoundingClientRect();
    
    mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.current.setFromCamera(mouse.current, camera);
    const intersects = raycaster.current.intersectObject(fogMesh.current);

    if (intersects.length > 0) {
      const intersection = intersects[0];
      const uv = intersection.uv;
      
      if (uv) {
        // Конвертируем UV координаты в мировые координаты
        const worldX = uv.x * mapSize.width;
        const worldY = (1 - uv.y) * mapSize.height;
        
        // Используем store методы для рисования
        if (paintMode === 'reveal') {
          drawVisibleArea(worldX, worldY);
        } else {
          hideVisibleArea(worldX, worldY);
        }
      }
    }
  };


  // Add event listeners for DM painting
  useEffect(() => {
    if (!isDM || !shouldHandleFogInteraction()) return;

    const canvas = gl.domElement;
    
    const wrappedPointerDown = (e: Event) => handlePointerDown(e as PointerEvent);
    const wrappedPointerMove = (e: Event) => handlePointerMove(e as PointerEvent);
    
    canvas.addEventListener('pointerdown', wrappedPointerDown);
    window.addEventListener('pointermove', wrappedPointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      canvas.removeEventListener('pointerdown', wrappedPointerDown);
      window.removeEventListener('pointermove', wrappedPointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDM, shouldHandleFogInteraction, isPainting, brushSize]);

  if (!fogTexture) return null;

  return (
    <mesh
      ref={fogMesh}
      position={[0, 0.01, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      renderOrder={100}
    >
      <planeGeometry args={[24, 16]} />
      <primitive object={fogShaderMaterial} attach="material" />
    </mesh>
  );
};