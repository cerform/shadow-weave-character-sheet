import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useFogOfWarStore } from '@/stores/fogOfWarStore';

interface FogOfWar3DProps {
  mapSize: { width: number; height: number };
  isDM: boolean;
}

export const FogOfWar3D: React.FC<FogOfWar3DProps> = ({
  mapSize,
  isDM
}) => {
  const { gl, camera } = useThree();
  const {
    visibleAreas,
    fogSettings,
    fogTransform,
    activeMode,
    isDrawing,
    drawVisibleArea,
    hideVisibleArea
  } = useFogOfWarStore();
  
  const fogMesh = useRef<THREE.Mesh>(null);
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  
  // Grid dimensions for fog texture
  const gridWidth = Math.ceil(mapSize.width / 25); // 25px grid
  const gridHeight = Math.ceil(mapSize.height / 25);

  // Create fog texture based on visible areas
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
        const gridX = Math.floor((area.x / mapSize.width) * gridWidth);
        const gridY = Math.floor((area.y / mapSize.height) * gridHeight);
        const gridRadius = Math.ceil((area.radius / 25));
        
        // Draw circle
        ctx.beginPath();
        ctx.arc(gridX, gridY, gridRadius, 0, Math.PI * 2);
        ctx.fill();
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
        fogColor: { value: new THREE.Color(fogSettings.fogColor) },
        fogOpacity: { value: isDM ? fogSettings.fogOpacity * 0.5 : fogSettings.fogOpacity },
        time: { value: 0 },
        offsetX: { value: fogTransform.offsetX },
        offsetY: { value: fogTransform.offsetY },
        scale: { value: fogTransform.scale }
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
        uniform float offsetX;
        uniform float offsetY;
        uniform float scale;
        varying vec2 vUv;
        
        float noise(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }
        
        void main() {
          // Apply transform to UV coordinates
          vec2 transformedUv = vUv;
          transformedUv.x = (transformedUv.x - offsetX / 1200.0) / scale;
          transformedUv.y = (transformedUv.y - offsetY / 800.0) / scale;
          
          // Clamp to texture bounds
          if (transformedUv.x < 0.0 || transformedUv.x > 1.0 || transformedUv.y < 0.0 || transformedUv.y > 1.0) {
            gl_FragColor = vec4(fogColor, fogOpacity);
            return;
          }
          
          float revealed = texture2D(fogTexture, transformedUv).r;
          
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
  }, [fogTexture, fogSettings, fogTransform, isDM]);

  // Update shader uniforms
  useFrame((state) => {
    if (fogShaderMaterial) {
      fogShaderMaterial.uniforms.time.value = state.clock.elapsedTime;
      fogShaderMaterial.uniforms.fogColor.value.setHex(parseInt(fogSettings.fogColor.replace('#', ''), 16));
      fogShaderMaterial.uniforms.fogOpacity.value = isDM ? fogSettings.fogOpacity * 0.5 : fogSettings.fogOpacity;
      fogShaderMaterial.uniforms.offsetX.value = fogTransform.offsetX;
      fogShaderMaterial.uniforms.offsetY.value = fogTransform.offsetY;
      fogShaderMaterial.uniforms.scale.value = fogTransform.scale;
    }
  });

  // Handle mouse interactions for DM painting
  const handlePointerDown = (event: PointerEvent) => {
    if (!isDM || activeMode !== 'fog') return;
    
    event.preventDefault();
    event.stopPropagation();
    
    paintFog(event);
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (!isDM || !isDrawing || activeMode !== 'fog') return;
    
    event.preventDefault();
    event.stopPropagation();
    paintFog(event);
  };

  const paintFog = (event: PointerEvent) => {
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
        // Convert UV to map coordinates
        const mapX = uv.x * mapSize.width;
        const mapY = (1 - uv.y) * mapSize.height;
        
        // Check if we should reveal or hide based on modifier keys
        if (event.shiftKey) {
          drawVisibleArea(mapX, mapY);
        } else if (event.altKey) {
          hideVisibleArea(mapX, mapY);
        }
      }
    }
  };

  // Add event listeners for DM painting
  useEffect(() => {
    if (!isDM || activeMode !== 'fog') return;

    const canvas = gl.domElement;
    canvas.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, [isDM, isDrawing, activeMode]);

  if (!fogSettings.enabled || !fogTexture) return null;

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