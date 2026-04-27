// src/vtt/hooks/useVTT.ts
import { useRef, useEffect, useState } from 'react';
import { VTTCore } from '../engine/VTTCore';
import type { VTTConfig, VTTState } from '../types/engine';
import type { FogBrush } from '../types/fog';
import { useEnhancedBattleStore } from '@/stores/enhancedBattleStore';
import * as THREE from 'three';
import { useEnhancedBattleStore } from '@/stores/enhancedBattleStore';
import { enhancedTokenToVTT } from '../utils/tokenAdapter';
import type { BattleToken } from '@/services/socket';

export interface VTTInteractionCallbacks {
  onTokenMove?: (tokenId: string, newX: number, newY: number) => void;
  onTokenClick?: (tokenId: string, event: PointerEvent) => void;
  onTokenContextMenu?: (tokenId: string, event: PointerEvent) => void;
}

export function useVTT(config: VTTConfig, callbacks?: VTTInteractionCallbacks) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const coreRef = useRef<VTTCore | null>(null);
  const [state, setState] = useState<VTTState>({
    initialized: false,
    loading: true,
    error: null
  });

  // Fog state
  const [fogEnabled, setFogEnabled] = useState(true);
  const [brush, setBrush] = useState<FogBrush>({
    mode: 'reveal',
    radius: 3,
    strength: 1.0
  });

  // Get tokens from Zustand store
  const tokens = useEnhancedBattleStore((state) => state.tokens);

  useEffect(() => {
    if (!canvasRef.current) return;

    console.log('[useVTT] Initializing VTT Core');
    
    try {
      // Initialize VTT Core ONCE
      coreRef.current = new VTTCore(canvasRef.current, config);
      coreRef.current.start();
      
      setState({
        initialized: true,
        loading: false,
        error: null
      });

      console.log('[useVTT] VTT Core initialized successfully');
    } catch (error) {
      console.error('[useVTT] Failed to initialize:', error);
      setState({
        initialized: false,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Cleanup on unmount or sessionId change
    return () => {
      console.log('[useVTT] Cleaning up VTT Core');
      if (coreRef.current) {
        coreRef.current.dispose();
        coreRef.current = null;
      }
    };
  }, [config.sessionId]); // Only re-initialize if sessionId changes

  // Map user inputs (Pan, Zoom, Drag&Drop)
  useEffect(() => {
    const canvas = canvasRef.current;
    const core = coreRef.current;
    if (!canvas || !core || !state.initialized) return;

    const rendererCore = core.getRenderer();
    const camera = rendererCore.camera;
    const scene = rendererCore.scene;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    let isPanning = false;
    let isDraggingToken = false;
    let draggedTokenId: string | null = null;
    let dragStartPos = { x: 0, y: 0 };
    let panStartPos = { x: 0, y: 0 };
    let cameraStartPos = { x: 0, y: 0 };

    const getIntersectedToken = (clientX: number, clientY: number): string | null => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      
      raycaster.setFromCamera(mouse, camera);
      const tokenRenderer = core.getTokenRenderer();
      const meshes = tokenRenderer.getAllTokenMeshes();
      const intersects = raycaster.intersectObjects(meshes);
      
      if (intersects.length > 0) {
        return intersects[0].object.userData.tokenId;
      }
      return null;
    };

    const getWorldCoords = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      
      const v = new THREE.Vector3(mouse.x, mouse.y, 0).unproject(camera);
      return { x: v.x, y: v.y };
    };

    const onPointerDown = (e: PointerEvent) => {
      // Setup coords
      const tokenId = getIntersectedToken(e.clientX, e.clientY);
      
      if (e.button === 2 || (e.button === 0 && e.altKey)) {
        // Right click or Alt+Left Click -> Pan map
        isPanning = true;
        panStartPos = { x: e.clientX, y: e.clientY };
        cameraStartPos = { x: camera.position.x, y: camera.position.y };
        canvas.setPointerCapture(e.pointerId);
      } else if (e.button === 0) {
        if (tokenId) {
          // Clicked a token -> Start drag
          isDraggingToken = true;
          draggedTokenId = tokenId;
          dragStartPos = { x: e.clientX, y: e.clientY };
          canvas.setPointerCapture(e.pointerId);
          callbacks?.onTokenClick?.(tokenId, e);
          core.selectToken(tokenId);
        } else {
           core.deselectAllTokens();
        }
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (isPanning) {
        // Calculate orthographic pan delta
        const dx = e.clientX - panStartPos.x;
        const dy = e.clientY - panStartPos.y;
        
        // Convert screen pixel delta to world delta. 
        // In Orthographic, height=camera.top - camera.bottom = 2 * d
        // We know d is the half-height.
        const viewportHeight = canvas.clientHeight;
        const viewportWidth = canvas.clientWidth;
        
        const worldHeight = camera.top - camera.bottom;
        const worldWidth = camera.right - camera.left;
        
        const wx = (dx / viewportWidth) * worldWidth;
        const wy = (dy / viewportHeight) * worldHeight;

        camera.position.x = cameraStartPos.x - wx;
        camera.position.y = cameraStartPos.y + wy;
        camera.updateProjectionMatrix();

      } else if (isDraggingToken && draggedTokenId) {
        // Drag token in real-time (pure local UI update)
        const world = getWorldCoords(e.clientX, e.clientY);
        core.getTokenRenderer().updateTokenPosition(draggedTokenId, world.x, world.y, false);
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      canvas.releasePointerCapture(e.pointerId);
      if (isPanning) {
        isPanning = false;
      }
      if (isDraggingToken && draggedTokenId) {
        isDraggingToken = false;
        const world = getWorldCoords(e.clientX, e.clientY);
        
        // Grid Snap if configured
        let finalX = world.x;
        let finalY = world.y;
        if (config.gridSize) {
           finalX = Math.round(world.x / config.gridSize) * config.gridSize;
           finalY = Math.round(world.y / config.gridSize) * config.gridSize;
           core.getTokenRenderer().updateTokenPosition(draggedTokenId, finalX, finalY, false);
        }
        
        if (Math.abs(e.clientX - dragStartPos.x) > 3 || Math.abs(e.clientY - dragStartPos.y) > 3) {
          callbacks?.onTokenMove?.(draggedTokenId, finalX, finalY);
        }
        draggedTokenId = null;
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      // Zoom
      const zoomFactor = 1.1;
      if (e.deltaY < 0) {
        camera.zoom *= zoomFactor;
      } else {
        camera.zoom /= zoomFactor;
      }
      
      // limit zoom bounds
      camera.zoom = Math.max(0.1, Math.min(10, camera.zoom));
      camera.updateProjectionMatrix();
    };

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      const tokenId = getIntersectedToken(e.clientX, e.clientY);
      if (tokenId && callbacks?.onTokenContextMenu) {
         callbacks.onTokenContextMenu(tokenId, e as any);
      }
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('contextmenu', onContextMenu);

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('contextmenu', onContextMenu);
    };
  }, [state.initialized, config.gridSize, callbacks]);

  // Sync tokens from Zustand store to WebGL renderer
  useEffect(() => {
    if (!coreRef.current || !state.initialized) return;

    console.log('[useVTT] Syncing tokens from Zustand store:', tokens.length);

    // Update all tokens in WebGL renderer
    tokens.forEach((token) => {
      const vttToken = enhancedTokenToVTT(token);
      coreRef.current?.addOrUpdateToken(vttToken);
    });

    // TODO: Remove tokens that no longer exist in store
    // (need to track previous tokens)

  }, [tokens, state.initialized]);

  // Initialize fog of war
  const initializeFog = async (sessionId: string, mapId: string, isDM: boolean, gridWidth: number, gridHeight: number) => {
    if (!coreRef.current) return;
    await coreRef.current.initializeFog(sessionId, mapId, isDM, gridWidth, gridHeight);
  };

  // Handle fog brush interaction
  const handleFogBrush = (worldX: number, worldZ: number) => {
    if (!coreRef.current || !config.isDM) return;

    if (brush.mode === 'reveal') {
      coreRef.current.revealFog(worldX, worldZ, brush);
    } else {
      coreRef.current.hideFog(worldX, worldZ, brush);
    }
  };

  return { 
    canvasRef, 
    core: coreRef.current,
    state,
    fog: {
      enabled: fogEnabled,
      setEnabled: setFogEnabled,
      brush,
      setBrush,
      handleBrush: handleFogBrush,
      initializeFog
    }
  };
}
