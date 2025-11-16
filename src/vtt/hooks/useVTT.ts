// src/vtt/hooks/useVTT.ts
import { useRef, useEffect, useState } from 'react';
import { VTTCore } from '../engine/VTTCore';
import type { VTTConfig, VTTState } from '../types/engine';
import type { FogBrush } from '../types/fog';
import { useEnhancedBattleStore } from '@/stores/enhancedBattleStore';
import { enhancedTokenToVTT } from '../utils/tokenAdapter';

export function useVTT(config: VTTConfig) {
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
