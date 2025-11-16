import React, { useCallback } from 'react';
import { MapTexture } from './MapTexture';
import { GridLayer } from './GridLayer';
import { TokenLayer } from './TokenLayer';
import { FogOfWarLayer } from './FogOfWarLayer';
import type { EnhancedToken } from '@/stores/enhancedBattleStore';

interface BattleMap2DProps {
  mapImageUrl: string | null;
  mapWidth: number;
  mapHeight: number;
  tokens: EnhancedToken[];
  selectedTokenId: string | null;
  fogData: Uint8Array;
  gridVisible: boolean;
  fogVisible: boolean;
  use3D: boolean;
  onTokenClick: (tokenId: string) => void;
  onTokenMove: (tokenId: string, position: [number, number, number]) => void;
  onContextMenu: (e: React.MouseEvent, tokenId?: string) => void;
  onMapDrop?: (file: File) => void;
}

export function BattleMap2D({
  mapImageUrl,
  mapWidth,
  mapHeight,
  tokens,
  selectedTokenId,
  fogData,
  gridVisible,
  fogVisible,
  use3D,
  onTokenClick,
  onTokenMove,
  onContextMenu,
  onMapDrop,
}: BattleMap2DProps) {
  const handleMapContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onContextMenu(e);
    },
    [onContextMenu]
  );

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-background"
      onContextMenu={handleMapContextMenu}
    >
      {/* Map Background */}
      <MapTexture
        imageUrl={mapImageUrl}
        width={mapWidth}
        height={mapHeight}
        onDrop={onMapDrop}
      />

      {/* Grid */}
      <GridLayer width={mapWidth} height={mapHeight} visible={gridVisible} />

      {/* Tokens */}
      <TokenLayer
        tokens={tokens}
        selectedId={selectedTokenId}
        use3D={use3D}
        onTokenClick={onTokenClick}
        onTokenDrag={onTokenMove}
        onContextMenu={(e, tokenId) => {
          e.preventDefault();
          e.stopPropagation();
          onContextMenu(e, tokenId);
        }}
      />

      {/* Fog of War */}
      <FogOfWarLayer
        fogData={fogData}
        width={mapWidth}
        height={mapHeight}
        visible={fogVisible}
      />
    </div>
  );
}
