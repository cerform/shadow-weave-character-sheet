import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Group, Text, Circle, Image as KonvaImage } from 'react-konva';
import { Button } from '@/components/ui/button';
import { Plus, Upload, Trash2, Edit, Settings, Users } from 'lucide-react';
import { defaultTokens } from '@/data/defaultTokens';
import SimpleTokenEditor from './SimpleTokenEditor';
import MapControls from './MapControls';
import useImage from 'use-image';

// Token component to fix hooks violation
const TokenComponent = ({ token, zoom, mapPosition, selectedTokenId, onTokenClick }: {
  token: Token;
  zoom: number;
  mapPosition: { x: number; y: number };
  selectedTokenId: string | null;
  onTokenClick: (tokenId: string) => void;
}) => {
  const [tokenImage] = useImage(token.avatar || '');
  
  return (
    <Group
      key={token.id}
      x={(token.x * zoom) + mapPosition.x}
      y={(token.y * zoom) + mapPosition.y}
      onClick={() => onTokenClick(token.id)}
    >
      {/* Token Base */}
      <Circle
        radius={50 / 2 - 4}
        offsetX={-50 / 2}
        offsetY={-50 / 2}
        fill={token.color}
        stroke={selectedTokenId === token.id ? '#fbbf24' : '#000000'}
        strokeWidth={selectedTokenId === token.id ? 4 : 2}
      />

      {/* Token Avatar */}
      {tokenImage ? (
        <KonvaImage
          image={tokenImage}
          x={4}
          y={4}
          width={50 - 8}
          height={50 - 20}
          cornerRadius={4}
        />
      ) : (
        /* Token Name if no avatar */
        <Text
          text={token.name}
          fontSize={10}
          fill="#ffffff"
          x={6}
          y={6}
          width={50 - 12}
          height={15}
          ellipsis={true}
        />
      )}

      {/* HP Bar */}
      <Rect
        x={6}
        y={50 - 12}
        width={50 - 12}
        height={4}
        fill="#333333"
        cornerRadius={2}
      />
      <Rect
        x={6}
        y={50 - 12}
        width={(50 - 12) * (token.hp / token.maxHp)}
        height={4}
        fill={token.hp > token.maxHp * 0.5 ? '#22c55e' : token.hp > token.maxHp * 0.25 ? '#eab308' : '#ef4444'}
        cornerRadius={2}
      />
    </Group>
  );
};

export interface Token {
  id: string;
  name: string;
  avatar?: string;
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
  tags?: string[];
  notes?: string;
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
  const [editingToken, setEditingToken] = useState<Token | null>(null);
  const [showTokenLibrary, setShowTokenLibrary] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mapImage] = useImage(mapImageUrl || '');
  
  // Состояние для управления картой
  const [zoom, setZoom] = useState(1);
  const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 });
  const [gridVisible, setGridVisible] = useState(true);
  const [gridOpacity, setGridOpacity] = useState(0.5);
  const [gridScale, setGridScale] = useState(1);
  const [gridPosition, setGridPosition] = useState({ x: 0, y: 0 });
  
  // Состояние для управления мышью
  const [isDragging, setIsDragging] = useState(false);
  const [lastPointerPosition, setLastPointerPosition] = useState({ x: 0, y: 0 });
  const stageRef = useRef(null);
  const [fogOfWar, setFogOfWar] = useState(false);
  const [revealRadius, setRevealRadius] = useState(3);
  const [isDynamicLighting, setDynamicLighting] = useState(false);

  console.log('🎲 TacticalBattleMap render:', { 
    tokensCount: tokens.length, 
    selectedToken: selectedTokenId,
    availableSquares: availableSquares.length,
    editingToken: editingToken?.id
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
    setShowTokenLibrary(true);
  }, []);

  const addTokenFromLibrary = useCallback((defaultToken: any) => {
    const newToken: Token = {
      id: `token_${Date.now()}`,
      name: defaultToken.name,
      avatar: defaultToken.image,
      x: 100,
      y: 100,
      color: '#3b82f6',
      size: 40,
      hp: defaultToken.suggestedHP || 30,
      maxHp: defaultToken.suggestedHP || 30,
      ac: defaultToken.suggestedAC || 15,
      speed: 30,
      type: defaultToken.type === 'humanoid' ? 'player' : 'monster',
      controlledBy: defaultToken.type === 'humanoid' ? 'player1' : 'dm',
      tags: [defaultToken.type],
      notes: defaultToken.description
    };
    onTokensChange([...tokens, newToken]);
    setShowTokenLibrary(false);
  }, [tokens, onTokensChange]);

  const handleEditToken = useCallback((token: Token) => {
    setEditingToken(token);
  }, []);

  const handleSaveToken = useCallback((editedToken: Token) => {
    const updatedTokens = tokens.map(t => 
      t.id === editedToken.id ? editedToken : t
    );
    onTokensChange(updatedTokens);
    setEditingToken(null);
  }, [tokens, onTokensChange]);

  const handleDeleteToken = useCallback(() => {
    if (!editingToken) return;
    const updatedTokens = tokens.filter(t => t.id !== editingToken.id);
    onTokensChange(updatedTokens);
    setEditingToken(null);
  }, [editingToken, tokens, onTokensChange]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onMapChange) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      onMapChange(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, [onMapChange]);

  // Обработчики управления картой
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.1, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(1);
  }, []);

  // Обработка колесика мыши для масштабирования
  const handleWheel = useCallback((e: any) => {
    e.evt.preventDefault();
    
    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    
    const scaleBy = 1.1;
    const oldScale = zoom;
    
    let newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    newScale = Math.max(0.3, Math.min(5, newScale));
    
    if (newScale !== oldScale) {
      // Масштабирование относительно позиции курсора
      const mousePointTo = {
        x: (pointer.x - mapPosition.x) / oldScale,
        y: (pointer.y - mapPosition.y) / oldScale,
      };

      const newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      };

      setZoom(newScale);
      setMapPosition(newPos);
    }
  }, [zoom, mapPosition]);

  // Обработка перетаскивания карты
  const handleMouseDown = useCallback((e: any) => {
    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    
    // Проверяем нажатие Alt или Ctrl
    if (e.evt.altKey || e.evt.ctrlKey) {
      setIsDragging(true);
      setLastPointerPosition(pointer);
      stage.container().style.cursor = 'move';
    }
  }, []);

  const handleMouseMove = useCallback((e: any) => {
    if (!isDragging) return;
    
    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    
    const deltaX = pointer.x - lastPointerPosition.x;
    const deltaY = pointer.y - lastPointerPosition.y;
    
    setMapPosition(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
    
    setLastPointerPosition(pointer);
  }, [isDragging, lastPointerPosition]);

  const handleMouseUp = useCallback((e: any) => {
    if (isDragging) {
      setIsDragging(false);
      const stage = e.target.getStage();
      stage.container().style.cursor = 'default';
    }
  }, [isDragging]);

  const handleMoveMap = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    const step = 20;
    setMapPosition(prev => {
      switch (direction) {
        case 'up': return { ...prev, y: prev.y + step };
        case 'down': return { ...prev, y: prev.y - step };
        case 'left': return { ...prev, x: prev.x + step };
        case 'right': return { ...prev, x: prev.x - step };
        default: return prev;
      }
    });
  }, []);

  // Обработчики управления сеткой
  const handleGridZoomIn = useCallback(() => {
    setGridScale(prev => Math.min(prev + 0.1, 2));
  }, []);

  const handleGridZoomOut = useCallback(() => {
    setGridScale(prev => Math.max(prev - 0.1, 0.5));
  }, []);

  const handleResetGridZoom = useCallback(() => {
    setGridScale(1);
  }, []);

  const handleMoveGrid = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    const step = 10;
    setGridPosition(prev => {
      switch (direction) {
        case 'up': return { ...prev, y: prev.y + step };
        case 'down': return { ...prev, y: prev.y - step };
        case 'left': return { ...prev, x: prev.x + step };
        case 'right': return { ...prev, x: prev.x - step };
        default: return prev;
      }
    });
  }, []);

  const handleAlignGridToMap = useCallback(() => {
    setGridPosition(mapPosition);
    setGridScale(zoom);
  }, [mapPosition, zoom]);

  const handleResetFogOfWar = useCallback(() => {
    // Логика сброса тумана войны
    console.log('🌫️ Resetting fog of war');
  }, []);

  const handleAddLight = useCallback((type: 'torch' | 'lantern' | 'daylight' | 'custom', color?: string, intensity?: number) => {
    console.log('💡 Adding light source:', { type, color, intensity });
  }, []);

  return (
    <div className="w-full h-full bg-slate-900 flex">
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-10">
        <MapControls
          fogOfWar={fogOfWar}
          setFogOfWar={setFogOfWar}
          revealRadius={revealRadius}
          setRevealRadius={setRevealRadius}
          gridVisible={gridVisible}
          setGridVisible={setGridVisible}
          gridOpacity={gridOpacity}
          setGridOpacity={setGridOpacity}
          onResetFogOfWar={handleResetFogOfWar}
          isDM={isDM}
          isDynamicLighting={isDynamicLighting}
          setDynamicLighting={setDynamicLighting}
          onAddLight={handleAddLight}
          onMoveMap={handleMoveMap}
          zoom={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetZoom={handleResetZoom}
          onMoveGrid={handleMoveGrid}
          gridScale={gridScale}
          onGridZoomIn={handleGridZoomIn}
          onGridZoomOut={handleGridZoomOut}
          onResetGridZoom={handleResetGridZoom}
          onAlignGridToMap={handleAlignGridToMap}
        />
      </div>

      {/* Sidebar */}
      {isDM && (
        <div className="w-80 bg-slate-800 p-4 space-y-4 overflow-y-auto">
          <h3 className="text-lg font-bold text-white">D&D Боевая Карта</h3>
          
          <div className="bg-slate-700 p-3 rounded text-sm text-white">
            <h4 className="font-semibold mb-2">📏 Правила движения:</h4>
            <ul className="space-y-1 text-xs">
              <li>• 1 клетка = 5 футов</li>
              <li>• Стандартная скорость = 30 футов (6 клеток)</li>
              <li>• Клик на токен → показать доступные клетки</li>
              <li>• Клик на зеленую клетку → переместить</li>
              <li>• ПКМ на токен → редактировать</li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button onClick={addToken} className="w-full" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Добавить
            </Button>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              size="sm"
            >
              <Upload className="w-4 h-4 mr-1" />
              Фон
            </Button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          <div className="space-y-2">
            <h4 className="text-md font-semibold text-white flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Токены на карте ({tokens.length}):
            </h4>
            {tokens.map((token) => (
              <div
                key={token.id}
                className={`p-2 rounded text-sm cursor-pointer transition-colors ${
                  selectedTokenId === token.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
                onClick={() => handleTokenClick(token.id)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  handleEditToken(token);
                }}
              >
                <div className="flex items-center space-x-2">
                  {token.avatar ? (
                    <img
                      src={token.avatar}
                      alt={token.name}
                      className="w-6 h-6 rounded object-cover"
                    />
                  ) : (
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: token.color }}
                    />
                  )}
                  <span className="flex-1">{token.name}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditToken(token);
                    }}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                </div>
                <div className="text-xs opacity-75 mt-1">
                  Скорость: {token.speed} футов ({feetToSquares(token.speed)} клеток)
                </div>
                <div className="text-xs opacity-75">
                  HP: {token.hp}/{token.maxHp} | AC: {token.ac}
                </div>
                {token.tags && token.tags.length > 0 && (
                  <div className="text-xs opacity-50 mt-1">
                    🏷️ {token.tags.join(', ')}
                  </div>
                )}
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

          {/* Библиотека токенов */}
          {showTokenLibrary && (
            <div className="bg-slate-700 p-3 rounded">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-white">Выберите токен:</h4>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowTokenLibrary(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {defaultTokens.map((defaultToken) => (
                  <div
                    key={defaultToken.id}
                    className="bg-slate-600 p-2 rounded cursor-pointer hover:bg-slate-500 transition-colors"
                    onClick={() => addTokenFromLibrary(defaultToken)}
                  >
                    <img
                      src={defaultToken.image}
                      alt={defaultToken.name}
                      className="w-full h-12 object-cover rounded mb-1"
                    />
                    <div className="text-xs text-white text-center">
                      {defaultToken.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Game Board */}
      <div className="flex-1 overflow-hidden">
        <Stage 
          ref={stageRef}
          width={window.innerWidth - 400} 
          height={window.innerHeight - 100}
          className="bg-slate-700"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onClick={(e) => {
            // Проверяем что не нажаты Alt/Ctrl (чтобы не мешать перетаскиванию)
            if (!e.evt.altKey && !e.evt.ctrlKey) {
              const pos = e.target.getStage().getPointerPosition();
              if (pos) {
                // Корректируем координаты с учетом масштаба и позиции
                const adjustedX = (pos.x - mapPosition.x) / zoom;
                const adjustedY = (pos.y - mapPosition.y) / zoom;
                handleSquareClick(adjustedX, adjustedY);
              }
            }
          }}
        >
          <Layer>
            {/* Map and Grid Group */}
            <Group
              x={mapPosition.x}
              y={mapPosition.y}
              scaleX={zoom}
              scaleY={zoom}
            >
              {/* Background Map */}
              {mapImage && (
                <KonvaImage 
                  image={mapImage} 
                  width={GRID_COLS * GRID_SIZE} 
                  height={GRID_ROWS * GRID_SIZE} 
                />
              )}

              {/* Grid Lines */}
              {gridVisible && (
                <Group
                  x={gridPosition.x}
                  y={gridPosition.y}
                  scaleX={gridScale}
                  scaleY={gridScale}
                  opacity={gridOpacity}
                >
                  {Array.from({ length: GRID_COLS + 1 }, (_, i) => (
                    <Rect
                      key={`v-${i}`}
                      x={i * GRID_SIZE}
                      y={0}
                      width={2}
                      height={GRID_ROWS * GRID_SIZE}
                      fill="rgba(255,255,255,0.8)"
                    />
                  ))}
                  {Array.from({ length: GRID_ROWS + 1 }, (_, i) => (
                    <Rect
                      key={`h-${i}`}
                      x={0}
                      y={i * GRID_SIZE}
                      width={GRID_COLS * GRID_SIZE}
                      height={2}
                      fill="rgba(255,255,255,0.8)"
                    />
                  ))}
                </Group>
              )}

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
                <TokenComponent
                  key={token.id}
                  token={token}
                  zoom={1}
                  mapPosition={{x: 0, y: 0}}
                  selectedTokenId={selectedTokenId}
                  onTokenClick={handleTokenClick}
                />
              ))}
            </Group>
          </Layer>
        </Stage>
      </div>

      {/* Token Editor */}
      {editingToken && (
        <SimpleTokenEditor
          token={editingToken}
          onSave={handleSaveToken}
          onDelete={handleDeleteToken}
          onCancel={() => setEditingToken(null)}
        />
      )}
    </div>
  );
};

export default TacticalBattleMap;