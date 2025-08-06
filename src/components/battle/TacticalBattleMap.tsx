import React, { useState, useCallback } from 'react';
import { Stage, Layer, Rect, Group, Text, Circle, Image as KonvaImage } from 'react-konva';
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
  speed: number; // скорость в футах (обычно 30)
  type: 'player' | 'monster' | 'npc';
  controlledBy?: string;
}

interface TacticalBattleMapProps {
  isDM?: boolean;
  tokens: Token[];
  onTokensChange: (tokens: Token[]) => void;
  mapImageUrl?: string;
  onMapChange?: (url: string) => void;
}

const GRID_SIZE = 50; // размер клетки в пикселях
const FEET_PER_SQUARE = 5; // 1 клетка = 5 футов в D&D
const GRID_ROWS = 16;
const GRID_COLS = 24;

// Конвертация футов в клетки
const feetToSquares = (feet: number) => Math.floor(feet / FEET_PER_SQUARE);

// Привязка к сетке
const snapToGrid = (value: number) => Math.round(value / GRID_SIZE) * GRID_SIZE;

// Получить координаты клетки
const getGridCoords = (x: number, y: number) => ({
  gridX: Math.round(x / GRID_SIZE),
  gridY: Math.round(y / GRID_SIZE)
});

// Расстояние между клетками
const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);
  return Math.max(dx, dy); // D&D использует "квадратное" расстояние
};

const TacticalBattleMap: React.FC<TacticalBattleMapProps> = ({
  isDM = true,
  tokens,
  onTokensChange,
  mapImageUrl,
  onMapChange
}) => {
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [availableSquares, setAvailableSquares] = useState<{x: number, y: number}[]>([]);
  const [mapImage] = useImage(mapImageUrl || '');

  console.log('🎲 TacticalBattleMap render:', { 
    tokensCount: tokens.length, 
    selectedToken: selectedTokenId,
    availableSquares: availableSquares.length 
  });

  const calculateAvailableSquares = useCallback((token: Token) => {
    const { gridX: startX, gridY: startY } = getGridCoords(token.x, token.y);
    const maxDistance = feetToSquares(token.speed);
    const squares: {x: number, y: number}[] = [];

    console.log(`🎯 Calculating movement for ${token.name}: ${token.speed} feet = ${maxDistance} squares`);

    for (let x = 0; x < GRID_COLS; x++) {
      for (let y = 0; y < GRID_ROWS; y++) {
        const distance = getDistance(startX, startY, x, y);
        
        if (distance <= maxDistance && distance > 0) {
          // Проверяем что клетка не занята другим токеном
          const isOccupied = tokens.some(t => 
            t.id !== token.id && 
            getGridCoords(t.x, t.y).gridX === x && 
            getGridCoords(t.x, t.y).gridY === y
          );
          
          if (!isOccupied) {
            squares.push({ x: x * GRID_SIZE, y: y * GRID_SIZE });
          }
        }
      }
    }

    console.log(`✅ Available squares: ${squares.length}`);
    return squares;
  }, [tokens]);

  const handleTokenClick = useCallback((tokenId: string) => {
    const token = tokens.find(t => t.id === tokenId);
    if (!token) return;

    // Проверяем права на управление токеном
    if (!isDM && token.controlledBy !== 'player1') {
      console.log('❌ No permission to move this token');
      return;
    }

    if (selectedTokenId === tokenId) {
      // Отменяем выбор
      console.log('🚫 Deselecting token:', tokenId);
      setSelectedTokenId(null);
      setAvailableSquares([]);
    } else {
      // Выбираем токен и показываем доступные клетки
      console.log('🎯 Selecting token for movement:', tokenId);
      setSelectedTokenId(tokenId);
      const squares = calculateAvailableSquares(token);
      setAvailableSquares(squares);
    }
  }, [tokens, selectedTokenId, isDM, calculateAvailableSquares]);

  const handleSquareClick = useCallback((x: number, y: number) => {
    if (!selectedTokenId) return;

    const snappedX = snapToGrid(x);
    const snappedY = snapToGrid(y);

    // Проверяем что клетка доступна для движения
    const isAvailable = availableSquares.some(square => 
      square.x === snappedX && square.y === snappedY
    );

    if (!isAvailable) {
      console.log('❌ Square not available for movement');
      return;
    }

    console.log(`🚀 Moving token ${selectedTokenId} to (${snappedX}, ${snappedY})`);

    // Перемещаем токен
    const updatedTokens = tokens.map(token =>
      token.id === selectedTokenId 
        ? { ...token, x: snappedX, y: snappedY }
        : token
    );

    onTokensChange(updatedTokens);
    
    // Сбрасываем выбор
    setSelectedTokenId(null);
    setAvailableSquares([]);
  }, [selectedTokenId, availableSquares, tokens, onTokensChange]);

  const addToken = useCallback(() => {
    const newToken: Token = {
      id: `token_${Date.now()}`,
      name: `Fighter ${tokens.length + 1}`,
      x: 100,
      y: 100,
      color: '#3b82f6',
      size: 40,
      hp: 30,
      maxHp: 30,
      ac: 16,
      speed: 30, // 30 футов стандартная скорость
      type: 'player',
      controlledBy: 'player1'
    };
    onTokensChange([...tokens, newToken]);
  }, [tokens, onTokensChange]);

  return (
    <div className="w-full h-full bg-slate-900 flex">
      {/* Sidebar */}
      {isDM && (
        <div className="w-80 bg-slate-800 p-4 space-y-4">
          <h3 className="text-lg font-bold text-white">D&D Боевая Карта</h3>
          
          <div className="bg-slate-700 p-3 rounded text-sm text-white">
            <h4 className="font-semibold mb-2">📏 Правила движения:</h4>
            <ul className="space-y-1 text-xs">
              <li>• 1 клетка = 5 футов</li>
              <li>• Стандартная скорость = 30 футов (6 клеток)</li>
              <li>• Клик на токен → показать доступные клетки</li>
              <li>• Клик на зеленую клетку → переместить</li>
            </ul>
          </div>

          <Button onClick={addToken} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Добавить персонажа
          </Button>

          <div className="space-y-2">
            <h4 className="text-md font-semibold text-white">Токены на карте:</h4>
            {tokens.map((token) => (
              <div
                key={token.id}
                className={`p-2 rounded text-sm cursor-pointer transition-colors ${
                  selectedTokenId === token.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
                onClick={() => handleTokenClick(token.id)}
              >
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: token.color }}
                  />
                  <span>{token.name}</span>
                </div>
                <div className="text-xs opacity-75">
                  Скорость: {token.speed} футов ({feetToSquares(token.speed)} клеток)
                </div>
                <div className="text-xs opacity-75">
                  HP: {token.hp}/{token.maxHp} | AC: {token.ac}
                </div>
              </div>
            ))}
          </div>

          {selectedTokenId && (
            <div className="bg-green-900 p-3 rounded text-white text-sm">
              <p>🎯 Выбран: {tokens.find(t => t.id === selectedTokenId)?.name}</p>
              <p>Доступно клеток: {availableSquares.length}</p>
              <p className="text-xs mt-1">Кликните на зеленую клетку для перемещения</p>
            </div>
          )}
        </div>
      )}

      {/* Game Board */}
      <div className="flex-1">
        <Stage 
          width={GRID_COLS * GRID_SIZE} 
          height={GRID_ROWS * GRID_SIZE}
          className="bg-slate-700"
          onClick={(e) => {
            // Клик по пустой области сетки
            if (e.target === e.target.getStage()) {
              const pos = e.target.getStage().getPointerPosition();
              if (pos) {
                handleSquareClick(pos.x, pos.y);
              }
            }
          }}
        >
          <Layer>
            {/* Background */}
            {mapImage && (
              <KonvaImage 
                image={mapImage} 
                width={GRID_COLS * GRID_SIZE} 
                height={GRID_ROWS * GRID_SIZE} 
              />
            )}

            {/* Grid Lines */}
            {Array.from({ length: GRID_COLS + 1 }, (_, i) => (
              <Rect
                key={`v-${i}`}
                x={i * GRID_SIZE}
                y={0}
                width={1}
                height={GRID_ROWS * GRID_SIZE}
                fill="rgba(255,255,255,0.3)"
              />
            ))}
            {Array.from({ length: GRID_ROWS + 1 }, (_, i) => (
              <Rect
                key={`h-${i}`}
                x={0}
                y={i * GRID_SIZE}
                width={GRID_COLS * GRID_SIZE}
                height={1}
                fill="rgba(255,255,255,0.3)"
              />
            ))}

            {/* Available Movement Squares */}
            {availableSquares.map((square, index) => (
              <Rect
                key={`available-${index}`}
                x={square.x}
                y={square.y}
                width={GRID_SIZE}
                height={GRID_SIZE}
                fill="rgba(34, 197, 94, 0.4)"
                stroke="#22c55e"
                strokeWidth={2}
                listening={true}
                onClick={() => handleSquareClick(square.x, square.y)}
              />
            ))}

            {/* Tokens */}
            {tokens.map((token) => (
              <Group
                key={token.id}
                x={token.x}
                y={token.y}
                onClick={() => handleTokenClick(token.id)}
              >
                {/* Token Base */}
                <Circle
                  radius={GRID_SIZE / 2 - 4}
                  offsetX={-GRID_SIZE / 2}
                  offsetY={-GRID_SIZE / 2}
                  fill={token.color}
                  stroke={selectedTokenId === token.id ? '#fbbf24' : '#000000'}
                  strokeWidth={selectedTokenId === token.id ? 4 : 2}
                />

                {/* Token Name */}
                <Text
                  text={token.name}
                  fontSize={10}
                  fill="#ffffff"
                  x={6}
                  y={6}
                  width={GRID_SIZE - 12}
                  height={15}
                  ellipsis={true}
                />

                {/* HP Bar */}
                <Rect
                  x={6}
                  y={GRID_SIZE - 12}
                  width={GRID_SIZE - 12}
                  height={4}
                  fill="#333333"
                  cornerRadius={2}
                />
                <Rect
                  x={6}
                  y={GRID_SIZE - 12}
                  width={(GRID_SIZE - 12) * (token.hp / token.maxHp)}
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

export default TacticalBattleMap;