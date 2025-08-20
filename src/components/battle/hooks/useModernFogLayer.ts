// Modern fog layer hook with performance optimizations
import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type * as THREE from 'three';
import { ModernFogRenderer } from '@/systems/fog/modern/ModernFogRenderer';
import { useEnhancedFogStore } from '@/stores/enhancedFogStore';

export function useModernFogLayer(
  scene: THREE.Scene, 
  mapId = 'main-map', 
  tileSize = 1,
  autoInitialize = true
) {
  const rendererRef = useRef<ModernFogRenderer | null>(null);
  const updateCounterRef = useRef(0);
  const lastUpdateTimeRef = useRef(0);

  // Initialize fog renderer
  useEffect(() => {
    const renderer = new ModernFogRenderer(scene, mapId, tileSize);
    rendererRef.current = renderer;

    (async () => {
      try {
        await renderer.initialize();
        
        if (autoInitialize) {
          // Initialize map with default settings
          const store = useEnhancedFogStore.getState();
          store.initializeMap(mapId, 24, 24, false);
          
          // Reveal a small starting area in the center  
          store.revealArea(mapId, 12, 12, 2);
        }
        
        // Initial update
        renderer.updateFromStore();
        console.log('Modern fog layer initialized successfully');
      } catch (error) {
        console.error('Failed to initialize modern fog layer:', error);
      }
    })();

    // Subscribe to store changes with throttling
    const unsubscribe = useEnhancedFogStore.subscribe(
      (state) => state.maps,
      () => {
        const now = Date.now();
        
        // Throttle updates to max 30 FPS
        if (now - lastUpdateTimeRef.current < 33) {
          return;
        }
        
        lastUpdateTimeRef.current = now;
        updateCounterRef.current++;
        
        // Update renderer
        rendererRef.current?.updateFromStore();
      },
      {
        fireImmediately: false,
        equalityFn: (a, b) => {
          // Only update if the specific map has changed
          const mapA = a.get(mapId);
          const mapB = b.get(mapId);
          return mapA === mapB;
        }
      }
    );

    return () => {
      unsubscribe();
      renderer.dispose();
      rendererRef.current = null;
    };
  }, [scene, mapId, tileSize, autoInitialize]);

  // Animation frame updates
  useFrame((state, delta) => {
    rendererRef.current?.tick(delta, state.clock.elapsedTime);
  });

  // Expose renderer and stats
  return {
    renderer: rendererRef.current,
    updateCount: updateCounterRef.current,
    isInitialized: !!rendererRef.current
  };
}