// src/components/battle/fog/UnifiedFogOverlay3D.tsx
import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useUnifiedFogStore } from '@/stores/unifiedFogStore';

interface UnifiedFogOverlay3DProps {
  mapSize: { width: number; height: number };
  enabled?: boolean;
  isDM?: boolean;
}

export const UnifiedFogOverlay3D: React.FC<UnifiedFogOverlay3DProps> = ({
  mapSize,
  enabled = true,
  isDM = false
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const textureRef = useRef<THREE.CanvasTexture>(null);
  const { gl, camera, scene } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  const {
    fogGrid,
    isDrawing,
    setIsDrawing,
    brushSize,
    revealArea,
    hideArea,
    activeMode
  } = useUnifiedFogStore();

  // Create fog texture based on grid state
  const fogTexture = useMemo(() => {
    if (!fogGrid) return null;

    const canvas = document.createElement('canvas');
    canvas.width = fogGrid.cols;
    canvas.height = fogGrid.rows;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return null;

    // Create ImageData for the fog texture
    const imageData = ctx.createImageData(fogGrid.cols, fogGrid.rows);
    
    for (let x = 0; x < fogGrid.cols; x++) {
      for (let y = 0; y < fogGrid.rows; y++) {
        const opacity = fogGrid.getOpacity(x, y);
        const index = (y * fogGrid.cols + x) * 4;
        
        // Set RGBA values
        imageData.data[index] = 0;     // R
        imageData.data[index + 1] = 0; // G
        imageData.data[index + 2] = 0; // B
        imageData.data[index + 3] = Math.round(opacity * 255); // A
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    texture.flipY = false;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;
    
    return texture;
  }, [fogGrid]);

  // Update texture when fog grid changes
  useEffect(() => {
    if (materialRef.current && fogTexture) {
      materialRef.current.uniforms.fogTexture.value = fogTexture;
      materialRef.current.needsUpdate = true;
    }
  }, [fogTexture]);

  // Fog shader material
  const fogMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        fogTexture: { value: fogTexture },
        mapSize: { value: new THREE.Vector2(mapSize.width, mapSize.height) },
        fogOpacity: { value: 1.0 }
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
        uniform vec2 mapSize;
        uniform float fogOpacity;
        varying vec2 vUv;
        
        void main() {
          vec4 fogSample = texture2D(fogTexture, vUv);
          float alpha = fogSample.a * fogOpacity;
          gl_FragColor = vec4(0.0, 0.0, 0.0, alpha);
        }
      `,
      transparent: true,
      blending: THREE.NormalBlending,
      depthWrite: false
    });
  }, [fogTexture, mapSize]);

  // Mouse interaction for DM painting
  useEffect(() => {
    if (!isDM || !enabled || activeMode !== 'fog') return;

    const handleMouseDown = (event: MouseEvent) => {
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
      
      raycaster.current.setFromCamera(mouse.current, camera);
      
      // Raycast against the ground plane (y = 0)
      const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersection = new THREE.Vector3();
      raycaster.current.ray.intersectPlane(groundPlane, intersection);
      
      if (intersection) {
        // Convert 3D world coordinates to 2D map coordinates
        const x = ((intersection.x + mapSize.width / 2) / mapSize.width) * mapSize.width;
        const y = ((intersection.z + mapSize.height / 2) / mapSize.height) * mapSize.height;
        
        setIsDrawing(true);
        
        // Check if Alt key is pressed for hiding, otherwise reveal
        if (event.altKey) {
          hideArea(x, y);
        } else {
          revealArea(x, y);
        }
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDrawing) return;
      
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
      
      raycaster.current.setFromCamera(mouse.current, camera);
      
      const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersection = new THREE.Vector3();
      raycaster.current.ray.intersectPlane(groundPlane, intersection);
      
      if (intersection) {
        const x = ((intersection.x + mapSize.width / 2) / mapSize.width) * mapSize.width;
        const y = ((intersection.z + mapSize.height / 2) / mapSize.height) * mapSize.height;
        
        if (event.altKey) {
          hideArea(x, y);
        } else {
          revealArea(x, y);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDrawing(false);
    };

    gl.domElement.addEventListener('mousedown', handleMouseDown);
    gl.domElement.addEventListener('mousemove', handleMouseMove);
    gl.domElement.addEventListener('mouseup', handleMouseUp);

    return () => {
      gl.domElement.removeEventListener('mousedown', handleMouseDown);
      gl.domElement.removeEventListener('mousemove', handleMouseMove);
      gl.domElement.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDM, enabled, activeMode, isDrawing, mapSize, camera, gl.domElement, revealArea, hideArea, setIsDrawing]);

  if (!enabled || !fogGrid) return null;

  return (
    <mesh
      ref={meshRef}
      position={[0, 0.01, 0]} // Slightly above ground to avoid z-fighting
      rotation={[-Math.PI / 2, 0, 0]} // Rotate to lie flat on XZ plane
    >
      <planeGeometry args={[mapSize.width, mapSize.height]} />
      <primitive object={fogMaterial} ref={materialRef} />
    </mesh>
  );
};