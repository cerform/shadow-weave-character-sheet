import React from 'react';
import LayerPanel from '@/components/battle/vtt/LayerPanel';
import type { Layer } from '../types';

interface RightSidebarProps {
  layers: Layer[];
  isDM: boolean;
  onToggleLayer: (layerId: string) => void;
  onToggleLayerLock: (layerId: string) => void;
}

export function RightSidebar({ layers, isDM, onToggleLayer, onToggleLayerLock }: RightSidebarProps) {
  if (!isDM) return null;

  return (
    <div className="absolute right-0 top-0 bottom-0 w-64 bg-background/95 border-l border-border overflow-y-auto z-20">
      <div className="p-4">
        <LayerPanel
          layers={layers}
          activeLayerId={layers[0]?.id || 'map'}
          onLayerSelect={() => {}}
          onLayerToggleVisible={onToggleLayer}
          onLayerToggleLock={onToggleLayerLock}
          onLayerOpacityChange={() => {}}
          onLayerAdd={() => {}}
          onLayerDelete={() => {}}
          onLayerRename={() => {}}
        />
      </div>
    </div>
  );
}
