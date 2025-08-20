// Modern fog painting with optimized interactions
import { useCallback, useRef, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useEnhancedFogStore } from '@/stores/enhancedFogStore';

interface ModernFogPaintingOptions {
  mode: 'reveal' | 'hide';
  brushSize: number;
  mapId?: string;
  tileSize?: number;
  onPaintStart?: () => void;
  onPaintEnd?: () => void;
}

export function useModernFogPainting({
  mode,
  brushSize,
  mapId = 'main-map',
  tileSize = 1,
  onPaintStart,
  onPaintEnd
}: ModernFogPaintingOptions) {
  const { camera, raycaster, pointer } = useThree();
  const isDrawingRef = useRef(false);
  const lastPaintPositionRef = useRef<{ x: number; y: number } | null>(null);
  const paintThrottleRef = useRef<number>(0);
  
  // Create ground plane for raycasting
  const groundPlane = useMemo(() => 
    new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), 
    []
  );

  const getGridCoordinates = useCallback((event?: PointerEvent): { x: number; y: number } | null => {
    // Update raycaster from camera and pointer
    raycaster.setFromCamera(pointer, camera);
    
    // Find intersection with ground plane
    const intersectPoint = new THREE.Vector3();
    const intersection = raycaster.ray.intersectPlane(groundPlane, intersectPoint);
    
    if (!intersection) return null;
    
    // Convert world coordinates to grid coordinates
    // GridHelper creates 24x24 grid from -12 to +12
    const gridX = Math.floor(intersectPoint.x + 12);
    const gridZ = Math.floor(intersectPoint.z + 12);
    
    // Validate bounds
    if (gridX < 0 || gridX >= 24 || gridZ < 0 || gridZ >= 24) {
      return null;
    }
    
    return { x: gridX, y: gridZ };
  }, [camera, raycaster, pointer, groundPlane]);

  const paintAtPosition = useCallback((x: number, y: number, currentMode: 'reveal' | 'hide') => {
    const store = useEnhancedFogStore.getState();
    
    if (currentMode === 'reveal') {
      store.revealArea(mapId, x, y, brushSize);
    } else {
      store.hideArea(mapId, x, y, brushSize);
    }
    
    // Update last paint position
    lastPaintPositionRef.current = { x, y };
  }, [mapId, brushSize]);

  const handlePointerDown = useCallback((event: PointerEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const coords = getGridCoordinates(event);
    if (!coords) return;
    
    isDrawingRef.current = true;
    onPaintStart?.();
    
    // Determine paint mode based on modifiers
    let currentMode = mode;
    if (event.ctrlKey) {
      currentMode = 'hide';
    } else if (event.altKey) {
      currentMode = 'reveal';
    }
    
    paintAtPosition(coords.x, coords.y, currentMode);
  }, [getGridCoordinates, mode, paintAtPosition, onPaintStart]);

  const handlePointerMove = useCallback((event: PointerEvent) => {
    if (!isDrawingRef.current) return;
    
    // Throttle painting for performance
    const now = Date.now();
    if (now - paintThrottleRef.current < 50) return; // Max 20 FPS painting
    paintThrottleRef.current = now;
    
    event.preventDefault();
    event.stopPropagation();
    
    const coords = getGridCoordinates(event);
    if (!coords) return;
    
    // Skip if same position as last paint
    const lastPos = lastPaintPositionRef.current;
    if (lastPos && lastPos.x === coords.x && lastPos.y === coords.y) return;
    
    // Determine paint mode based on modifiers
    let currentMode = mode;
    if (event.ctrlKey) {
      currentMode = 'hide';
    } else if (event.altKey) {
      currentMode = 'reveal';
    }
    
    paintAtPosition(coords.x, coords.y, currentMode);
  }, [getGridCoordinates, mode, paintAtPosition]);

  const handlePointerUp = useCallback(() => {
    if (!isDrawingRef.current) return;
    
    isDrawingRef.current = false;
    lastPaintPositionRef.current = null;
    onPaintEnd?.();
  }, [onPaintEnd]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.code === 'KeyF' && !event.repeat) {
      // Toggle fog at mouse position
      const coords = getGridCoordinates();
      if (coords) {
        useEnhancedFogStore.getState().toggleCell(mapId, coords.x, coords.y);
      }
    }
  }, [getGridCoordinates, mapId]);

  // Return painting handlers and utilities
  return {
    handlers: {
      handlePointerDown,
      handlePointerMove,
      handlePointerUp,
      handleKeyDown
    },
    state: {
      isDrawing: isDrawingRef.current
    },
    utils: {
      getGridCoordinates,
      paintAtPosition
    }
  };
}