// src/vtt/hooks/useVTT.ts
import { useRef, useEffect, useState } from 'react';
import { VTTCore } from '../engine/VTTCore';
import type { VTTConfig, VTTState } from '../types/engine';

export function useVTT(config: VTTConfig) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const coreRef = useRef<VTTCore | null>(null);
  const [state, setState] = useState<VTTState>({
    initialized: false,
    loading: true,
    error: null
  });

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

  return { 
    canvasRef, 
    core: coreRef.current,
    state
  };
}
