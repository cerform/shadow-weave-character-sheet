import React, { useRef, useState, useCallback } from 'react';
import { Stage, Layer, Rect, Group, Text, Image as KonvaImage } from 'react-konva';
import { Button } from '@/components/ui/button';
import { Plus, Upload, Trash2 } from 'lucide-react';
import useImage from 'use-image';

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
  speed: number;
  type: 'player' | 'monster' | 'npc';
  controlledBy?: string;
}

interface SmoothBattleMapProps {
  isDM?: boolean;
  tokens: Token[];
  onTokensChange: (tokens: Token[]) => void;
  mapImageUrl?: string;
  onMapChange?: (url: string) => void;
}

const gridSize = 50;
const gridRows = 16;
const gridCols = 24;

const snapToGrid = (value: number) => Math.round(value / gridSize) * gridSize;

const SmoothBattleMap: React.FC<SmoothBattleMapProps> = ({
  isDM = true,
  tokens,
  onTokensChange,
  mapImageUrl,
  onMapChange
}) => {
  const stageRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draggedTokenId, setDraggedTokenId] = useState<string | null>(null);
  const [mapImage] = useImage(mapImageUrl || '');

  console.log('🗺️ SmoothBattleMap render:', { tokensCount: tokens.length, isDM });

  const addToken = useCallback(() => {
    const newToken: Token = {
      id: `token_${Date.now()}`,
      name: `Token ${tokens.length + 1}`,
      x: 100,
      y: 100,
      color: '#6b7280',
      size: 40,
      hp: 10,
      maxHp: 10,
      ac: 12,
      speed: 30,
      type: 'monster',
      controlledBy: 'dm'
    };
    console.log('➕ Adding new token:', newToken);
    onTokensChange([...tokens, newToken]);
  }, [tokens, onTokensChange]);

  const handleTokenDragStart = useCallback((tokenId: string) => {
    console.log('🎯 SMOOTH DRAG START:', tokenId);
    setDraggedTokenId(tokenId);
  }, []);

  const handleTokenDragEnd = useCallback((e: any, tokenId: string) => {
    console.log('🎯 SMOOTH DRAG END:', tokenId);
    
    const stage = e.target.getStage();
    const pointerPosition = stage.getPointerPosition();
    
    if (!pointerPosition) {
      setDraggedTokenId(null);
      return;
    }

    // Привязываем к сетке для аккуратности
    const newX = snapToGrid(pointerPosition.x);
    const newY = snapToGrid(pointerPosition.y);

    // Ограничиваем границами
    const boundedX = Math.max(0, Math.min(newX, (gridCols - 1) * gridSize));
    const boundedY = Math.max(0, Math.min(newY, (gridRows - 1) * gridSize));

    console.log('📍 SMOOTH MOVE:', { tokenId, from: e.target.position(), to: { x: boundedX, y: boundedY } });

    const updatedTokens = tokens.map(token =>
      token.id === tokenId ? { ...token, x: boundedX, y: boundedY } : token
    );

    onTokensChange(updatedTokens);
    setDraggedTokenId(null);
  }, [tokens, onTokensChange]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onMapChange) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      onMapChange(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, [onMapChange]);

  const clearTokens = useCallback(() => {
    onTokensChange([]);
  }, [onTokensChange]);

  return (
    <div className="w-full h-full bg-slate-900 flex">
      {/* Sidebar для DM */}
      {isDM && (
        <div className="w-80 bg-slate-800 p-4 space-y-4">
          <h3 className="text-lg font-bold text-white">Управление картой</h3>
          
          <Button onClick={addToken} className="w-full" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Добавить токен
          </Button>

          <Button
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
            variant="outline"
          >
            <Upload className="w-4 h-4 mr-2" />
            Загрузить фон
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          <Button onClick={clearTokens} variant="destructive" className="w-full">
            <Trash2 className="w-4 h-4 mr-2" />
            Очистить токены
          </Button>

          <div className="space-y-2">
            <h4 className="text-md font-semibold text-white">Токены ({tokens.length})</h4>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {tokens.map((token) => (
                <div
                  key={token.id}
                  className="p-2 rounded text-sm bg-slate-700 text-gray-300"
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: token.color }}
                    />
                    <span>{token.name}</span>
                  </div>
                  <div className="text-xs opacity-75">
                    HP: {token.hp}/{token.maxHp} | AC: {token.ac}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Konva Stage */}
      <div className="flex-1">
        <Stage 
          width={gridCols * gridSize} 
          height={gridRows * gridSize} 
          ref={stageRef}
          className="bg-slate-700"
        >
          <Layer>
            {/* Background Image */}
            {mapImage && (
              <KonvaImage 
                image={mapImage} 
                width={gridCols * gridSize} 
                height={gridRows * gridSize} 
              />
            )}

            {/* Grid */}
            {Array.from({ length: gridCols + 1 }, (_, i) => (
              <Rect
                key={`v-${i}`}
                x={i * gridSize}
                y={0}
                width={1}
                height={gridRows * gridSize}
                fill="rgba(255,255,255,0.1)"
              />
            ))}
            {Array.from({ length: gridRows + 1 }, (_, i) => (
              <Rect
                key={`h-${i}`}
                x={0}
                y={i * gridSize}
                width={gridCols * gridSize}
                height={1}
                fill="rgba(255,255,255,0.1)"
              />
            ))}

            {/* Tokens */}
            {tokens.map((token) => (
              <Group
                key={token.id}
                x={token.x}
                y={token.y}
                draggable={isDM || token.controlledBy === 'player1'} // TODO: dynamic user check
                onDragStart={() => handleTokenDragStart(token.id)}
                onDragEnd={(e) => handleTokenDragEnd(e, token.id)}
                opacity={draggedTokenId === token.id ? 0.8 : 1}
              >
                {/* Token Circle */}
                <Rect
                  width={gridSize - 4}
                  height={gridSize - 4}
                  x={2}
                  y={2}
                  fill={token.color}
                  cornerRadius={8}
                  stroke={draggedTokenId === token.id ? '#fbbf24' : '#000000'}
                  strokeWidth={draggedTokenId === token.id ? 3 : 1}
                />
                
                {/* Token Name */}
                <Text
                  text={token.name}
                  fontSize={12}
                  fill="#ffffff"
                  x={6}
                  y={6}
                  width={gridSize - 12}
                  height={20}
                  ellipsis={true}
                />

                {/* HP Bar */}
                <Rect
                  x={6}
                  y={gridSize - 12}
                  width={gridSize - 12}
                  height={4}
                  fill="#333333"
                  cornerRadius={2}
                />
                <Rect
                  x={6}
                  y={gridSize - 12}
                  width={(gridSize - 12) * (token.hp / token.maxHp)}
                  height={4}
                  fill={token.hp > token.maxHp * 0.5 ? '#22c55e' : token.hp > token.maxHp * 0.25 ? '#eab308' : '#ef4444'}
                  cornerRadius={2}
                />
              </Group>
            ))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default SmoothBattleMap;