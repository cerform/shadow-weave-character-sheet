import { useState, useEffect, useRef, useCallback } from 'react';
import { FogManager } from '@/game/fog/FogManager';
import { FogGridOptions, VisionSource } from '@/game/fog/FogTypes';

interface UseFogManagerOptions {
  mapSize: number;
  cellSize: number;
  sessionId?: string;
  mapId?: string;
}

export function useFogManager({ mapSize, cellSize, sessionId, mapId }: UseFogManagerOptions) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [updateCounter, setUpdateCounter] = useState(0);
  const fogManagerRef = useRef<FogManager | null>(null);

  // Инициализация менеджера тумана
  useEffect(() => {
    const gridOptions: FogGridOptions = {
      cols: Math.ceil(mapSize / cellSize),
      rows: Math.ceil(mapSize / cellSize),
      cellSize: cellSize
    };

    console.log('🌫️ Initializing FogManager with options:', gridOptions);

    const manager = new FogManager(gridOptions);
    
    // Установка callback для обновлений
    manager.setUpdateCallback(() => {
      console.log('🌫️ Fog updated, triggering re-render');
      setUpdateCounter(prev => prev + 1);
    });

    fogManagerRef.current = manager;
    setIsInitialized(true);

    // Начальное состояние - все скрыто
    manager.hideAll();

    console.log('🌫️ FogManager initialized successfully');
  }, [mapSize, cellSize]);

  // Методы управления
  const revealArea = useCallback((x: number, y: number, radius: number = 5) => {
    if (!fogManagerRef.current) return;
    console.log('🌫️ Revealing area at:', x, y, 'radius:', radius);
    fogManagerRef.current.revealArea(x, y, radius);
  }, []);

  const hideArea = useCallback((x: number, y: number, radius: number = 5) => {
    if (!fogManagerRef.current) return;
    console.log('🌫️ Hiding area at:', x, y, 'radius:', radius);
    fogManagerRef.current.hideArea(x, y, radius);
  }, []);

  const revealAll = useCallback(() => {
    if (!fogManagerRef.current) return;
    console.log('🌫️ Revealing all areas');
    fogManagerRef.current.revealAll();
  }, []);

  const hideAll = useCallback(() => {
    if (!fogManagerRef.current) return;
    console.log('🌫️ Hiding all areas');
    fogManagerRef.current.hideAll();
  }, []);

  const updateVisionSources = useCallback((sources: VisionSource[]) => {
    if (!fogManagerRef.current) return;
    console.log('🌫️ Updating vision sources:', sources.length);
    fogManagerRef.current.updateVisionSources(sources);
  }, []);

  return {
    fogManager: fogManagerRef.current,
    isInitialized,
    updateCounter,
    revealArea,
    hideArea,
    revealAll,
    hideAll,
    updateVisionSources
  };
}