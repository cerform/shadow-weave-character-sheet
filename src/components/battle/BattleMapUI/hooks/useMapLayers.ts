import { useState, useCallback, useMemo } from 'react';
import type { Layer } from '../types';

const DEFAULT_LAYERS: Layer[] = [
  { id: 'map', name: 'Карта', visible: true, locked: false, opacity: 1, type: 'map' },
  { id: 'grid', name: 'Сетка', visible: true, locked: false, opacity: 0.5, type: 'background' },
  { id: 'tokens', name: 'Токены', visible: true, locked: false, opacity: 1, type: 'tokens' },
  { id: 'fog', name: 'Туман войны', visible: true, locked: false, opacity: 1, type: 'fog' },
  { id: 'effects', name: 'Эффекты', visible: true, locked: false, opacity: 1, type: 'drawings' },
];

export function useMapLayers() {
  const [layers, setLayers] = useState<Layer[]>(DEFAULT_LAYERS);

  const handleToggleLayer = useCallback((layerId: string) => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
      )
    );
  }, []);

  const handleToggleLayerLock = useCallback((layerId: string) => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === layerId ? { ...layer, locked: !layer.locked } : layer
      )
    );
  }, []);

  const handleReorderLayers = useCallback((newLayers: Layer[]) => {
    setLayers(newLayers);
  }, []);

  const visibleLayers = useMemo(
    () => layers.filter((layer) => layer.visible),
    [layers]
  );

  const isLayerVisible = useCallback(
    (layerId: string) => {
      const layer = layers.find((l) => l.id === layerId);
      return layer?.visible ?? true;
    },
    [layers]
  );

  const isLayerLocked = useCallback(
    (layerId: string) => {
      const layer = layers.find((l) => l.id === layerId);
      return layer?.locked ?? false;
    },
    [layers]
  );

  return useMemo(() => ({
    layers,
    visibleLayers,
    handleToggleLayer,
    handleToggleLayerLock,
    handleReorderLayers,
    isLayerVisible,
    isLayerLocked,
  }), [layers, visibleLayers, handleToggleLayer, handleToggleLayerLock, handleReorderLayers, isLayerVisible, isLayerLocked]);
}
