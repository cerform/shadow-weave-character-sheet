import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

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
  const { user } = useAuth();
  const { gl, camera, scene } = useThree();
  const [fogCells, setFogCells] = useState<FogCell[]>([]);
  const [isPainting, setIsPainting] = useState(false);
  const [paintMode, setPaintMode] = useState<'reveal' | 'hide'>('reveal');
  
  const fogGeometry = useRef<THREE.PlaneGeometry>();
  const fogMaterial = useRef<THREE.ShaderMaterial>();
  const fogMesh = useRef<THREE.Mesh>();
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  // Grid dimensions
  const gridWidth = Math.ceil(mapSize.width / gridSize);
  const gridHeight = Math.ceil(mapSize.height / gridSize);

  // Load fog cells from database
  useEffect(() => {
    loadFogCells();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel(`fog_${mapId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'fog_of_war', filter: `map_id=eq.${mapId}` },
        () => loadFogCells()
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [mapId]);

  const loadFogCells = async () => {
    try {
      const { data, error } = await supabase
        .from('fog_of_war')
        .select('*')
        .eq('map_id', mapId);

      if (error) throw error;
      setFogCells(data || []);
      onFogUpdate?.(data || []);
    } catch (error) {
      console.error('Error loading fog cells:', error);
    }
  };

  // Create fog texture based on revealed cells
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
    fogCells.forEach(cell => {
      if (cell.is_revealed) {
        ctx.fillRect(cell.grid_x, cell.grid_y, 1, 1);
      }
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    
    return texture;
  }, [fogCells, gridWidth, gridHeight]);

  // Create fog shader material
  const fogShaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        fogTexture: { value: fogTexture },
        fogColor: { value: new THREE.Color(0x000000) },
        fogOpacity: { value: isDM ? 0.3 : 0.8 }, // DM sees less fog for editing
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

  // Handle mouse interactions for DM painting
  const handlePointerDown = (event: PointerEvent) => {
    if (!isDM) return;
    
    event.preventDefault();
    setIsPainting(true);
    
    // Determine paint mode based on modifier keys
    if (event.shiftKey) {
      setPaintMode('reveal');
    } else if (event.altKey) {
      setPaintMode('hide');
    }
    
    paintFog(event);
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (!isDM || !isPainting) return;
    paintFog(event);
  };

  const handlePointerUp = () => {
    setIsPainting(false);
  };

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
        const gridX = Math.floor(uv.x * gridWidth);
        const gridY = Math.floor((1 - uv.y) * gridHeight);
        
        await updateFogArea(gridX, gridY, paintMode === 'reveal');
      }
    }
  };

  const updateFogArea = async (centerX: number, centerY: number, reveal: boolean) => {
    try {
      const cellsToUpdate = [];
      
      for (let x = centerX - brushSize; x <= centerX + brushSize; x++) {
        for (let y = centerY - brushSize; y <= centerY + brushSize; y++) {
          const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
          if (distance <= brushSize && x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
            cellsToUpdate.push({
              session_id: sessionId,
              map_id: mapId,
              grid_x: x,
              grid_y: y,
              is_revealed: reveal,
              revealed_at: reveal ? new Date().toISOString() : null,
              revealed_by_user_id: reveal ? user?.id : null
            });
          }
        }
      }

      const { error } = await supabase
        .from('fog_of_war')
        .upsert(cellsToUpdate, { onConflict: 'session_id,map_id,grid_x,grid_y' });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating fog area:', error);
    }
  };

  // Add event listeners for DM painting
  useEffect(() => {
    if (!isDM) return;

    const canvas = gl.domElement;
    canvas.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDM, isPainting, brushSize]);

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