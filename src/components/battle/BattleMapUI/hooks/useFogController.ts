import { useState, useCallback } from 'react';
import { useFogStore } from '@/stores/fogStore';
import { useFogSync } from '@/hooks/useFogSync';
import type { FogCircle } from '../types';

export function useFogController(sessionId: string, mapId: string = 'main-map') {
  const [fogBrushSize, setFogBrushSize] = useState(3);
  const [fogMode, setFogMode] = useState<'reveal' | 'hide'>('reveal');
  const [fogEnabled, setFogEnabled] = useState(true);

  const { maps, reveal, clearMap } = useFogStore();
  
  // Sync fog with Supabase
  useFogSync(sessionId, mapId);

  const fogData = maps[mapId] || new Uint8Array();

  const handleAddFogCircle = useCallback(
    (circle: FogCircle) => {
      if (fogMode === 'reveal') {
        reveal(mapId, Math.floor(circle.x), Math.floor(circle.y), circle.r);
      }
      // Note: fogStore doesn't have 'hide' method, only 'reveal'
      // Hide mode would need to be implemented in the store
    },
    [mapId, fogMode, reveal]
  );

  const handleClearFog = useCallback(() => {
    clearMap(mapId);
  }, [mapId, clearMap]);

  const handleToggleFog = useCallback(() => {
    setFogEnabled((prev) => !prev);
  }, []);

  const handleSetFogBrushSize = useCallback((size: number) => {
    setFogBrushSize(Math.max(1, Math.min(10, size)));
  }, []);

  const handleSetFogMode = useCallback((mode: 'reveal' | 'hide') => {
    setFogMode(mode);
  }, []);

  return {
    fogData,
    fogBrushSize,
    fogMode,
    fogEnabled,
    handleAddFogCircle,
    handleClearFog,
    handleToggleFog,
    handleSetFogBrushSize,
    handleSetFogMode,
  };
}
