// 3D система тумана войны
import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useFogOfWarStore } from '@/stores/fogOfWarStore';
import { useUnifiedBattleStore } from '@/stores/unifiedBattleStore';
import * as THREE from 'three';

interface FogOfWar3DProps {
  enabled?: boolean;
}

export const FogOfWar3D: React.FC<FogOfWar3DProps> = ({ enabled = true }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  const { 
    fogGrid, 
    gridWidth, 
    gridHeight, 
    cellSize,
    isInitialized,
    initializeFog 
  } = useFogOfWarStore();
  
  const { isDM } = useUnifiedBattleStore();
  
  // Инициализируем туман если не инициализирован
  useEffect(() => {
    if (!isInitialized) {
      // Карта 24x24 клетки в мире 3D (каждая клетка = 1 unit)
      initializeFog(24, 24, 1);
      console.log('🌫️ FogOfWar3D: Инициализирован туман 24x24');
    }
  }, [isInitialized, initializeFog]);

  // Создаем текстуру тумана
  const fogTexture = useMemo(() => {
    if (!fogGrid.length) return null;
    
    const width = gridWidth;
    const height = gridHeight;
    const data = new Uint8Array(width * height);
    
    // Заполняем данные: 0 = туман, 255 = раскрыто
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x;
        data[index] = fogGrid[y][x] === 0 ? 0 : 255; // Если туман - черный, если раскрыто - белый
      }
    }
    
    const texture = new THREE.DataTexture(data, width, height, THREE.RedFormat);
    texture.needsUpdate = true;
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    
    console.log('🌫️ FogOfWar3D: Создана текстура тумана', width, 'x', height);
    return texture;
  }, [fogGrid, gridWidth, gridHeight]);

  // Шейдер для тумана
  const fogShader = useMemo(() => ({
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D fogTexture;
      uniform float opacity;
      varying vec2 vUv;
      
      void main() {
        float fogValue = texture2D(fogTexture, vUv).r;
        
        // Если туман (0), показываем черный с прозрачностью
        // Если раскрыто (1), полностью прозрачно
        if (fogValue > 0.5) {
          discard; // Раскрытые области невидимы
        }
        
        gl_FragColor = vec4(0.0, 0.0, 0.0, opacity);
      }
    `,
    uniforms: {
      fogTexture: { value: fogTexture },
      opacity: { value: isDM ? 0.3 : 0.8 } // ДМ видит туман слабее для лучшего обзора
    }
  }), [fogTexture, isDM]);

  // Обновляем текстуру при изменении тумана
  useEffect(() => {
    if (fogTexture && materialRef.current) {
      materialRef.current.uniforms.fogTexture.value = fogTexture;
      materialRef.current.uniforms.opacity.value = isDM ? 0.3 : 0.8;
      console.log('🌫️ FogOfWar3D: Обновлена текстура тумана');
    }
  }, [fogTexture, isDM]);

  if (!enabled || !fogTexture) {
    return null;
  }

  return (
    <mesh
      ref={meshRef}
      position={[0, 0.05, 0]} // Немного поднимаем над землей
      rotation={[-Math.PI / 2, 0, 0]} // Поворачиваем чтобы лежал горизонтально
    >
      <planeGeometry args={[24, 24]} /> {/* Размер карты в мире */}
      <shaderMaterial
        ref={materialRef}
        vertexShader={fogShader.vertexShader}
        fragmentShader={fogShader.fragmentShader}
        uniforms={fogShader.uniforms}
        transparent
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </mesh>
  );
};