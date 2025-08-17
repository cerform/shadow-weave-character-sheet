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
        fogOpacity: { value: isDM ? fogSettings.fogOpacity * 0.6 : fogSettings.fogOpacity },
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
        
        float smoothNoise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          
          float a = noise(i);
          float b = noise(i + vec2(1.0, 0.0));
          float c = noise(i + vec2(0.0, 1.0));
          float d = noise(i + vec2(1.0, 1.0));
          
          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }
        
        void main() {
          // Apply transform to UV coordinates
          vec2 transformedUv = vUv;
          transformedUv.x = (transformedUv.x - offsetX / 1200.0) / scale;
          transformedUv.y = (transformedUv.y - offsetY / 800.0) / scale;
          
          // Check if coordinates are outside texture bounds
          if (transformedUv.x < 0.0 || transformedUv.x > 1.0 || transformedUv.y < 0.0 || transformedUv.y > 1.0) {
            // Full fog opacity for areas outside bounds
            vec3 darkFog = mix(fogColor, vec3(0.1, 0.1, 0.2), 0.3);
            gl_FragColor = vec4(darkFog, min(fogOpacity + 0.3, 0.95));
            return;
          }
          
          float revealed = texture2D(fogTexture, transformedUv).r;
          
          // Create animated fog effect with multiple noise layers
          float time1 = time * 0.3;
          float time2 = time * 0.5;
          
          float noise1 = smoothNoise(vUv * 8.0 + vec2(time1, time2));
          float noise2 = smoothNoise(vUv * 16.0 - vec2(time2, time1)) * 0.5;
          float noise3 = smoothNoise(vUv * 32.0 + vec2(time1 * 2.0, time2 * 1.5)) * 0.25;
          
          float combinedNoise = noise1 + noise2 + noise3;
          
          if (revealed > 0.5) {
            // Revealed area - very transparent or completely transparent
            float edgeFade = smoothstep(0.5, 0.7, revealed);
            float alpha = (1.0 - edgeFade) * 0.1 + combinedNoise * 0.02;
            
            // Very light tint for revealed areas to show they're cleared
            vec3 clearColor = mix(fogColor, vec3(1.0, 1.0, 1.0), 0.8);
            gl_FragColor = vec4(clearColor, max(0.0, alpha));
          } else {
            // Hidden area - strong fog with enhanced contrast
            float alpha = fogOpacity + combinedNoise * 0.15;
            
            // Enhance fog color for better contrast
            vec3 enhancedFogColor = mix(fogColor, vec3(0.0, 0.0, 0.1), 0.4);
            
            // Add subtle color variation based on noise
            enhancedFogColor = mix(enhancedFogColor, vec3(0.1, 0.1, 0.3), combinedNoise * 0.2);
            
            // Ensure strong opacity for hidden areas
            alpha = clamp(alpha, 0.7, 0.95);
            
            gl_FragColor = vec4(enhancedFogColor, alpha);
          }
        }
      `
    });
  }, [fogTexture, fogSettings, fogTransform, isDM]);

  // Update shader uniforms
  useFrame((state) => {
    if (fogShaderMaterial) {
      fogShaderMaterial.uniforms.time.value = state.clock.elapsedTime;
      fogShaderMaterial.uniforms.fogColor.value.setHex(parseInt(fogSettings.fogColor.replace('#', ''), 16));
      fogShaderMaterial.uniforms.fogOpacity.value = isDM ? fogSettings.fogOpacity * 0.6 : fogSettings.fogOpacity;
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