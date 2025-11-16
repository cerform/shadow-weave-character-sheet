import React, { useMemo, useState } from 'react';
import type { EnhancedToken } from '@/stores/enhancedBattleStore';
import { TokenVisual } from '@/components/battle/TokenVisual';
import { sanitizeTokens } from '@/utils/tokenSanitizer';
import { GRID } from '../utils/constants';

interface TokenLayerProps {
  tokens: EnhancedToken[];
  selectedId: string | null;
  use3D: boolean;
  onTokenClick: (tokenId: string) => void;
  onTokenDrag: (tokenId: string, position: [number, number, number]) => void;
  onContextMenu: (e: React.MouseEvent, tokenId: string) => void;
}

export function TokenLayer({
  tokens,
  selectedId,
  use3D,
  onTokenClick,
  onTokenDrag,
  onContextMenu,
}: TokenLayerProps) {
  const [modelReady, setModelReady] = useState(true);
  const [brokenModels, setBrokenModels] = useState<Record<string, boolean>>({});
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // CRITICAL: Global TokenSanitizer prevents React Error #185
  const sortedTokens = useMemo(
    () => sanitizeTokens(tokens),
    [tokens]
  );

  const handleModelError = (tokenId: string, msg: string) => {
    setBrokenModels((prev) => ({ ...prev, [tokenId]: true }));
    console.error(`Model error for token ${tokenId}: ${msg}`);
  };

  const handleMouseDown = (e: React.MouseEvent, token: EnhancedToken) => {
    setDraggingId(token.id);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId) return;
    
    const x = Math.round((e.clientX - dragOffset.x) / GRID) * GRID;
    const y = Math.round((e.clientY - dragOffset.y) / GRID) * GRID;
    
    onTokenDrag(draggingId, [x, y, 0]);
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  return (
    <div 
      className="absolute inset-0 pointer-events-auto"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {sortedTokens.map((token) => (
        <div
          key={token.id}
          className={`absolute pointer-events-auto cursor-pointer transition-opacity ${
            selectedId === token.id ? 'ring-2 ring-primary' : ''
          } ${draggingId === token.id ? 'opacity-50' : ''}`}
          style={{
            left: token.position[0],
            top: token.position[1],
            width: GRID * (token.size || 1),
            height: GRID * (token.size || 1),
          }}
          onClick={() => onTokenClick(token.id)}
          onMouseDown={(e) => handleMouseDown(e, token)}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onContextMenu(e, token.id);
          }}
          title={`${token.name} (${token.hp}/${token.maxHp})`}
        >
          <TokenVisual
            token={{
              id: token.id,
              name: token.name,
              color: token.color || 'bg-blue-500',
              imageUrl: token.avatarUrl || token.image_url,
              modelUrl: token.modelUrl,
              modelScale: 1,
            }}
            use3D={use3D}
            modelReady={modelReady && !brokenModels[token.id]}
            onModelError={handleModelError}
          />
          <div className="absolute -bottom-1 left-0 right-0 h-2 bg-background/70 rounded-b-lg overflow-hidden">
            <div
              className="h-full bg-green-500"
              style={{ width: `${(token.hp / token.maxHp) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
