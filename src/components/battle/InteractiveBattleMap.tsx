import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Stage, Layer, Rect, Group, Text, Circle } from 'react-konva';
import useImage from 'use-image';
import { Button } from '@/components/ui/button';
import MapUploader from './MapUploader';

export interface Token {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;
  size: number;
  hp: number;
  maxHp: number;
  ac: number;
  type: 'player' | 'monster';
  controlledBy?: string;
}

interface Props {
  isDM?: boolean;
  tokens?: Token[];
  onTokensChange?: (tokens: Token[]) => void;
  mapImageUrl?: string;
  onMapChange?: (url: string) => void;
}

const GRID_SIZE = 64;
const COLS = 20;
const ROWS = 16;

const currentUserId = 'Player1'; // ⚠️ временно, замени на useAuth()

const InteractiveBattleMap: React.FC<Props> = ({
  isDM = false,
  tokens: externalTokens,
  onTokensChange,
  mapImageUrl,
  onMapChange
}) => {
  const [internalTokens, setInternalTokens] = useState<Token[]>([]);
  const [mapImage] = useImage(mapImageUrl || '');
  const tokens = externalTokens || internalTokens;
  const setTokens = onTokensChange || setInternalTokens;

  const [draggedId, setDraggedId] = useState<string | null>(null);

  const snapToGrid = (val: number) => Math.round(val / GRID_SIZE) * GRID_SIZE;

  const handleDragEnd = (id: string, x: number, y: number) => {
    const snappedX = snapToGrid(x);
    const snappedY = snapToGrid(y);
    const maxX = COLS * GRID_SIZE - GRID_SIZE;
    const maxY = ROWS * GRID_SIZE - GRID_SIZE;

    const boundedX = Math.max(0, Math.min(snappedX, maxX));
    const boundedY = Math.max(0, Math.min(snappedY, maxY));

    setTokens(tokens.map(t =>
      t.id === id ? { ...t, x: boundedX, y: boundedY } : t
    ));
    setDraggedId(null);
  };

  const canDrag = (token: Token) =>
    isDM || token.controlledBy === currentUserId;

  const addToken = () => {
    const newToken: Token = {
      id: `token_${Date.now()}`,
      name: 'New Token',
      x: GRID_SIZE * 2,
      y: GRID_SIZE * 2,
      size: GRID_SIZE * 0.9,
      hp: 10,
      maxHp: 10,
      ac: 12,
      color: '#7777dd',
      type: 'player',
      controlledBy: currentUserId
    };
    setTokens([...tokens, newToken]);
  };

  const clearTokens = () => {
    setTokens([]);
  };

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="flex gap-2 p-2 bg-muted border-b border-border items-center">
        <Button onClick={addToken}>+ Добавить токен</Button>
        <Button variant="destructive" onClick={clearTokens}>Очистить карту</Button>
        <MapUploader currentMapUrl={mapImageUrl} onMapLoaded={onMapChange || (() => {})} />
      </div>

      <div className="flex-1 relative">
        <Stage width={COLS * GRID_SIZE} height={ROWS * GRID_SIZE}>
          <Layer>
            {/* Карта */}
            {mapImage ? (
              <Rect
                x={0}
                y={0}
                width={COLS * GRID_SIZE}
                height={ROWS * GRID_SIZE}
                fillPatternImage={mapImage}
                fillPatternScale={{ x: 1, y: 1 }}
              />
            ) : (
              <Rect
                x={0}
                y={0}
                width={COLS * GRID_SIZE}
                height={ROWS * GRID_SIZE}
                fill="#1e293b"
              />
            )}

            {/* Сетка */}
            {[...Array(COLS)].map((_, c) => (
              <Rect
                key={`v-${c}`}
                x={c * GRID_SIZE}
                y={0}
                width={1}
                height={ROWS * GRID_SIZE}
                fill="#334155"
                opacity={0.2}
              />
            ))}
            {[...Array(ROWS)].map((_, r) => (
              <Rect
                key={`h-${r}`}
                x={0}
                y={r * GRID_SIZE}
                width={COLS * GRID_SIZE}
                height={1}
                fill="#334155"
                opacity={0.2}
              />
            ))}

            {/* Токены */}
            {tokens.map(token => (
              <Group
                key={token.id}
                x={token.x}
                y={token.y}
                draggable={canDrag(token)}
                onDragStart={() => setDraggedId(token.id)}
                onDragEnd={e => handleDragEnd(token.id, e.target.x(), e.target.y())}
              >
                <Circle
                  radius={token.size / 2}
                  fill={token.color}
                  stroke={draggedId === token.id ? 'yellow' : 'black'}
                  strokeWidth={2}
                />
                <Text
                  text={token.name}
                  fontSize={12}
                  fill="white"
                  x={-token.size / 2}
                  y={token.size / 2 + 4}
                  width={token.size}
                  align="center"
                />
              </Group>
            ))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default InteractiveBattleMap;