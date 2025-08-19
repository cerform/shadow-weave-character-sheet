import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useFogOfWarStore } from '@/stores/fogOfWarStore';
import { useBattle3DControlStore } from '@/stores/battle3DControlStore';

interface SimpleFog3DProps {
  sessionId: string;
  mapId: string;
}

export const SimpleFog3D: React.FC<SimpleFog3DProps> = ({
  sessionId,
  mapId
}) => {
  const { gl, camera } = useThree();
  const meshRef = useRef<THREE.Mesh>(null);
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const [isPainting, setIsPainting] = useState(false);
  
  const { 
    visibleAreas, 
    fogSettings, 
    drawVisibleArea, 
    hideVisibleArea,
    loadFogFromDatabase,
    saveFogToDatabase
  } = useFogOfWarStore();
  
  const { shouldHandleFogInteraction, keysPressed, isMouseDown } = useBattle3DControlStore();

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

  // Создание текстуры тумана
  const fogTexture = useMemo(() => {
    console.log('🌫️ SimpleFog3D: Creating fog texture with', visibleAreas.length, 'visible areas');
    console.log('🌫️ Fog settings:', fogSettings);
    
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return null;

    // Заливаем черным (туман)
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, size, size);

    // Рисуем открытые области белым
    ctx.fillStyle = 'white';
    visibleAreas.forEach(area => {
      if (area.type === 'circle') {
        const x = (area.x / 50) * size; // Масштабируем к размеру карты 50x50
        const y = (area.y / 50) * size;
        const radius = (area.radius / 50) * size;
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    
    return texture;
  }, [visibleAreas]);

  // Материал шейдера
  const fogMaterial = useMemo(() => {
    if (!fogTexture) return null;
    
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        fogTexture: { value: fogTexture },
        fogOpacity: { value: 0.9 }
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
        uniform float fogOpacity;
        varying vec2 vUv;
        
        void main() {
          float revealed = texture2D(fogTexture, vUv).r;
          float alpha = (1.0 - revealed) * fogOpacity;
          gl_FragColor = vec4(0.0, 0.0, 0.0, alpha);
        }
      `
    });
  }, [fogTexture]);

  // Обработка рисования
  const paintFog = (event: PointerEvent) => {
    if (!meshRef.current) return;

    const canvas = gl.domElement;
    const rect = canvas.getBoundingClientRect();
    
    mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.current.setFromCamera(mouse.current, camera);
    const intersects = raycaster.current.intersectObject(meshRef.current);

    if (intersects.length > 0) {
      const intersection = intersects[0];
      const point = intersection.point;
      
      // Конвертируем в координаты карты (50x50)
      const worldX = point.x + 25; // Смещение, чтобы центр был в 0,0
      const worldY = point.z + 25;
      
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
  }, [shouldHandleFogInteraction, keysPressed, isPainting, gl.domElement]);

  // Синхронизация состояния рисования
  useEffect(() => {
    if (!isMouseDown) {
      setIsPainting(false);
    }
  }, [isMouseDown]);

  if (!fogSettings.enabled || !fogMaterial) {
    console.log('🌫️ SimpleFog3D: Not rendering - enabled:', fogSettings.enabled, 'material:', !!fogMaterial);
    return null;
  }

  console.log('🌫️ SimpleFog3D: Rendering fog mesh');

  return (
    <mesh
      ref={meshRef}
      position={[0, 0.02, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      renderOrder={1000}
    >
      <planeGeometry args={[50, 50]} />
      <primitive object={fogMaterial} attach="material" />
    </mesh>
  );
};