import React, { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useFogOfWarStore } from '@/stores/fogOfWarStore';
import * as THREE from 'three';

interface FogOfWar3DProps {
  mapWidth: number;
  mapHeight: number;
}

const FogPlane: React.FC<FogOfWar3DProps> = ({ mapWidth, mapHeight }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { fogSettings, visibleAreas = [], isPositionRevealed } = useFogOfWarStore();
  const { camera } = useThree();

  // Create fog texture
  const fogTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    const size = 1024;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Create gradient for fog effect
    const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    gradient.addColorStop(0, 'rgba(255,255,255,0)');
    gradient.addColorStop(0.7, 'rgba(255,255,255,0.3)');
    gradient.addColorStop(1, 'rgba(255,255,255,1)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }, []);

  // Dynamic fog shader material
  const fogMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        time: { value: 0 },
        fogColor: { value: new THREE.Color(fogSettings.fogColor) },
        fogOpacity: { value: fogSettings.fogOpacity },
        blurAmount: { value: fogSettings.blurAmount },
        fogTexture: { value: fogTexture },
        revealedAreas: { value: [] },
        mapSize: { value: new THREE.Vector2(mapWidth, mapHeight) }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          vUv = uv;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 fogColor;
        uniform float fogOpacity;
        uniform float blurAmount;
        uniform sampler2D fogTexture;
        uniform vec2 mapSize;
        
        varying vec2 vUv;
        varying vec3 vPosition;
        
        float noise(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }
        
        float fbm(vec2 p) {
          float value = 0.0;
          float amplitude = 0.5;
          
          for (int i = 0; i < 4; i++) {
            value += amplitude * noise(p);
            p *= 2.0;
            amplitude *= 0.5;
          }
          
          return value;
        }
        
        void main() {
          vec2 uv = vUv;
          
          // Animated fog movement
          vec2 fogUv = uv + vec2(time * 0.02, time * 0.01);
          
          // Multi-layer fog noise
          float fog1 = fbm(fogUv * 8.0);
          float fog2 = fbm(fogUv * 16.0 + vec2(time * 0.03, -time * 0.02));
          float fog3 = fbm(fogUv * 32.0 + vec2(-time * 0.01, time * 0.04));
          
          // Combine fog layers
          float fogNoise = (fog1 * 0.5 + fog2 * 0.3 + fog3 * 0.2);
          
          // Sample fog texture
          vec4 fogTex = texture2D(fogTexture, fogUv);
          
          // Combine all fog effects
          float finalFog = fogNoise * fogTex.r;
          
          // Apply color and opacity
          vec3 finalColor = mix(vec3(0.1, 0.1, 0.1), fogColor, finalFog);
          float alpha = fogOpacity * finalFog;
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `
    });
  }, [fogSettings, fogTexture, mapWidth, mapHeight]);

  // Update shader uniforms
  useFrame((state) => {
    if (meshRef.current && fogMaterial) {
      fogMaterial.uniforms.time.value = state.clock.getElapsedTime();
      fogMaterial.uniforms.fogColor.value.set(fogSettings.fogColor);
      fogMaterial.uniforms.fogOpacity.value = fogSettings.fogOpacity;
      fogMaterial.uniforms.blurAmount.value = fogSettings.blurAmount;
    }
  });

  if (!fogSettings.enabled) {
    return null;
  }

  return (
    <mesh
      ref={meshRef}
      position={[mapWidth / 2, 0.1, mapHeight / 2]}
      rotation={[-Math.PI / 2, 0, 0]}
      material={fogMaterial}
    >
      <planeGeometry args={[mapWidth, mapHeight, 64, 64]} />
    </mesh>
  );
};

// Revealed area holes in the fog
const RevealedArea: React.FC<{ 
  area: { x: number; y: number; radius: number; width?: number; height?: number; type: string }; 
  mapHeight: number; 
}> = ({ area, mapHeight }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    if (area.type === 'circle') {
      return new THREE.CircleGeometry(area.radius, 32);
    } else {
      return new THREE.PlaneGeometry(area.width || 100, area.height || 100);
    }
  }, [area]);

  const material = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0,
      blending: THREE.SubtractiveBlending
    });
  }, []);

  return (
    <mesh
      ref={meshRef}
      position={[area.x, 0.2, mapHeight - area.y]}
      rotation={[-Math.PI / 2, 0, 0]}
      geometry={geometry}
      material={material}
    />
  );
};

export const FogOfWar3D: React.FC<FogOfWar3DProps> = ({ mapWidth, mapHeight }) => {
  const { visibleAreas, fogSettings } = useFogOfWarStore();

  if (!fogSettings.enabled) {
    return null;
  }

  // Защита от undefined - обеспечиваем что visibleAreas всегда массив
  const revealedAreas = visibleAreas || [];

  return (
    <>
      <FogPlane mapWidth={mapWidth} mapHeight={mapHeight} />
      {revealedAreas.map((area) => (
        <RevealedArea
          key={area.id}
          area={area}
          mapHeight={mapHeight}
        />
      ))}
    </>
  );
};