import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Group, Circle, Image } from 'react-konva';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Settings, RotateCcw, Zap, Shield, Heart, Eye, EyeOff, Map } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SimpleTokenEditor from './SimpleTokenEditor';
import MapUploader from './MapUploader';
import TerrainPalette from './TerrainPalette';
import FogOfWarLayer, { VisibleArea } from './FogOfWarLayer';
import BattleMapWidget from './BattleMapWidget';
import useImage from 'use-image';

// Доступные размеры клеток
const GRID_SIZES = [32, 64, 128, 256];
const DEFAULT_GRID_SIZE = 64;

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
  speed: number;
  type: 'player' | 'monster' | 'npc';
  isActive?: boolean; // Активный ход
  conditions?: string[]; // Состояния (poisoned, charmed, etc.)
  controlledBy?: string;
  tags?: string[];
  notes?: string;
}

interface InteractiveBattleMapProps {
  isDM?: boolean;
  tokens?: Token[];
  onTokensChange?: (tokens: Token[]) => void;
  activeTokenId?: string;
  onTokenSelect?: (tokenId: string) => void;
  mapImageUrl?: string;
  onMapChange?: (imageUrl: string) => void;
}

const InteractiveBattleMap: React.FC<InteractiveBattleMapProps> = ({
  isDM = false,
  tokens: externalTokens,
  onTokensChange,
  activeTokenId,
  onTokenSelect,
  mapImageUrl,
  onMapChange
}) => {
  const { toast } = useToast();
  const stageRef = useRef(null);
  
  const [internalTokens, setInternalTokens] = useState<Token[]>([
    {
      id: 'goblin_scout',
      name: 'Goblin Scout',
      x: DEFAULT_GRID_SIZE * 8,
      y: DEFAULT_GRID_SIZE * 6,
      color: '#dc2626',
      size: DEFAULT_GRID_SIZE * 0.9,
      hp: 7,
      maxHp: 12,
      ac: 15,
      speed: 30,
      type: 'monster',
      conditions: ['poisoned'],
      controlledBy: 'DM',
      tags: ['humanoid', 'goblinoid']
    },
    {
      id: 'human_fighter',
      name: 'Sir Gareth',
      x: DEFAULT_GRID_SIZE * 3,
      y: DEFAULT_GRID_SIZE * 8,
      color: '#2563eb',
      size: DEFAULT_GRID_SIZE * 0.9,
      hp: 22,
      maxHp: 30,
      ac: 18,
      speed: 30,
      type: 'player',
      isActive: true,
      controlledBy: 'Player1',
      tags: ['human', 'fighter']
    },
    {
      id: 'elf_wizard',
      name: 'Lyralei',
      x: DEFAULT_GRID_SIZE * 2,
      y: DEFAULT_GRID_SIZE * 9,
      color: '#7c3aed',
      size: DEFAULT_GRID_SIZE * 0.9,
      hp: 18,
      maxHp: 18,
      ac: 12,
      speed: 30,
      type: 'player',
      controlledBy: 'Player2',
      tags: ['elf', 'wizard']
    }
  ]);

  const tokens = externalTokens || internalTokens;
  const setTokens = onTokensChange || setInternalTokens;

  const [draggedTokenId, setDraggedTokenId] = useState<string | null>(null);
  const [hoveredTokenId, setHoveredTokenId] = useState<string | null>(null);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [editingToken, setEditingToken] = useState<Token | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [gridSize, setGridSize] = useState(DEFAULT_GRID_SIZE);
  const [gridRows, setGridRows] = useState(20);
  const [gridCols, setGridCols] = useState(24);
  const [mapImage, setMapImage] = useState<string | null>(mapImageUrl || null);
  const [mapScale, setMapScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [selectedTerrain, setSelectedTerrain] = useState(null);
  const [activeTab, setActiveTab] = useState('tokens');
  const [windowSize, setWindowSize] = useState({ width: 1920, height: 1080 });
  const [showFogOfWar, setShowFogOfWar] = useState(true);
  const [fogVisibleAreas, setFogVisibleAreas] = useState<VisibleArea[]>([]);
  
  // Устанавливаем размеры окна
  useEffect(() => {
    const updateWindowSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    updateWindowSize();
    window.addEventListener('resize', updateWindowSize);
    
    return () => {
      window.removeEventListener('resize', updateWindowSize);
    };
  }, []);

  // Загружаем изображение карты
  const [mapBg] = useImage(mapImage || '');

  // Привязка к сетке
  const snapToGrid = useCallback((value: number) => {
    return Math.round(value / gridSize) * gridSize;
  }, [gridSize]);

  // Обработчики Drag & Drop
  const handleDragStart = useCallback((tokenId: string) => {
    if (!isDM && !tokens.find(t => t.id === tokenId && t.type === 'player')) {
      toast({
        title: "Нет доступа",
        description: "Вы можете перемещать только своих персонажей",
        variant: "destructive"
      });
      return false;
    }
    setDraggedTokenId(tokenId);
    return true;
  }, [isDM, tokens, toast]);

  const handleDragEnd = useCallback((tokenId: string, newX: number, newY: number) => {
    const snappedX = snapToGrid(newX);
    const snappedY = snapToGrid(newY);
    
    // Проверяем границы карты
    const mapWidth = gridCols * gridSize;
    const mapHeight = gridRows * gridSize;
    const boundedX = Math.max(0, Math.min(snappedX, mapWidth - gridSize));
    const boundedY = Math.max(0, Math.min(snappedY, mapHeight - gridSize));

    if (onTokensChange) {
      const updatedTokens = tokens.map(token => 
        token.id === tokenId 
          ? { ...token, x: boundedX, y: boundedY }
          : token
      );
      onTokensChange(updatedTokens);
    } else {
      setInternalTokens(prev => prev.map(token => 
        token.id === tokenId 
          ? { ...token, x: boundedX, y: boundedY }
          : token
      ));
    }
    
    setDraggedTokenId(null);
    
    const token = tokens.find(t => t.id === tokenId);
    if (token) {
      toast({
        title: "Токен перемещен",
        description: `${token.name} перемещен на позицию (${Math.floor(boundedX/gridSize)}, ${Math.floor(boundedY/gridSize)})`,
      });
    }
  }, [snapToGrid, setTokens, tokens, toast, gridCols, gridRows, gridSize]);

  // Клик по токену
  const handleTokenClick = useCallback((token: Token) => {
    setSelectedToken(token);
    if (onTokenSelect) {
      onTokenSelect(token.id);
    }
    if (isDM) {
      setEditingToken(token);
    }
    toast({
      title: "Токен выбран",
      description: `Выбран: ${token.name}`,
    });
  }, [onTokenSelect, isDM, toast]);

  // Компонент HP бара
  const renderHPBar = useCallback((token: Token) => {
    if (token.hp === undefined || token.maxHp === undefined) return null;
    
    const barWidth = token.size - 8;
    const barHeight = 8;
    const hpPercent = Math.max(0, Math.min(1, token.hp / token.maxHp));
    
    // Цвет в зависимости от здоровья
    let hpColor = '#22c55e'; // Зеленый
    if (hpPercent <= 0.25) hpColor = '#dc2626'; // Красный
    else if (hpPercent <= 0.5) hpColor = '#f59e0b'; // Оранжевый
    else if (hpPercent <= 0.75) hpColor = '#eab308'; // Желтый

    return (
      <Group x={4} y={-barHeight - 4}>
        {/* Фон бара */}
        <Rect
          width={barWidth}
          height={barHeight}
          fill="#1f2937"
          stroke="#374151"
          strokeWidth={1}
          cornerRadius={2}
        />
        {/* HP бар */}
        <Rect
          width={barWidth * hpPercent}
          height={barHeight}
          fill={hpColor}
          cornerRadius={2}
        />
        {/* Текст HP */}
        <Text
          text={`${token.hp}/${token.maxHp}`}
          fontSize={10}
          fill="#ffffff"
          x={2}
          y={1}
          fontFamily="monospace"
          fontStyle="bold"
        />
      </Group>
    );
  }, []);

  // Компонент индикаторов состояний
  const renderConditionIndicators = useCallback((token: Token) => {
    if (!token.conditions || token.conditions.length === 0) return null;

    return (
      <Group x={token.size - 20} y={-20}>
        {token.conditions.slice(0, 3).map((condition, index) => (
          <Group key={condition} x={index * 14} y={0}>
            <Circle
              radius={8}
              fill={getConditionColor(condition)}
              stroke="#ffffff"
              strokeWidth={2}
            />
            <Text
              text={getConditionIcon(condition)}
              fontSize={10}
              fill="#ffffff"
              x={-4}
              y={-4}
              fontStyle="bold"
            />
          </Group>
        ))}
      </Group>
    );
  }, []);

  // Цвета и иконки для состояний
  const getConditionColor = (condition: string): string => {
    const colors: Record<string, string> = {
      poisoned: '#16a34a',
      charmed: '#ec4899',
      frightened: '#8b5cf6',
      stunned: '#f59e0b',
      paralyzed: '#6b7280',
      unconscious: '#1f2937',
      blinded: '#374151',
      deafened: '#64748b'
    };
    return colors[condition] || '#6b7280';
  };

  const getConditionIcon = (condition: string): string => {
    const icons: Record<string, string> = {
      poisoned: '☠',
      charmed: '♥',
      frightened: '!',
      stunned: '⚡',
      paralyzed: '❄',
      unconscious: '💤',
      blinded: '👁',
      deafened: '🔇'
    };
    return icons[condition] || '?';
  };

  // Компонент токена
  const renderToken = useCallback((token: Token) => {
    const isActive = token.isActive || token.id === activeTokenId;
    const isDragged = draggedTokenId === token.id;
    const isHovered = hoveredTokenId === token.id;
    const isSelected = selectedToken?.id === token.id;

    const getTypeColor = (type: string) => {
      switch (type) {
        case 'player': return '#2563eb';
        case 'monster': return '#dc2626'; 
        case 'npc': return '#16a34a';
        default: return '#6b7280';
      }
    };

    return (
      <Group
        key={token.id}
        x={token.x}
        y={token.y}
        draggable={isDM || token.type === 'player'}
        onDragStart={() => handleDragStart(token.id)}
        onDragEnd={(e) => handleDragEnd(token.id, e.target.x(), e.target.y())}
        onMouseEnter={() => setHoveredTokenId(token.id)}
        onMouseLeave={() => setHoveredTokenId(null)}
        onClick={() => handleTokenClick(token)}
        opacity={isDragged ? 0.8 : 1}
        scaleX={isDragged ? 1.1 : isHovered ? 1.05 : 1}
        scaleY={isDragged ? 1.1 : isHovered ? 1.05 : 1}
      >
        {/* Тень токена */}
        <Circle
          x={token.size / 2 + 2}
          y={token.size / 2 + 2}
          radius={(token.size / 2) - 2}
          fill="#00000030"
        />
        
        {/* Основной токен */}
        <Circle
          x={token.size / 2}
          y={token.size / 2}
          radius={(token.size / 2) - 4}
          fill={token.color}
          stroke={isSelected ? "#fbbf24" : isActive ? "#10b981" : getTypeColor(token.type)}
          strokeWidth={isSelected ? 4 : isActive ? 3 : 2}
        />

        {/* Имя токена */}
        <Text
          text={token.name}
          fontSize={11}
          fill="#ffffff"
          fontStyle="bold"
          x={2}
          y={token.size - 16}
          width={token.size - 4}
          ellipsis={true}
          align="center"
        />

        {/* AC индикатор */}
        <Group x={token.size - 18} y={4}>
          <Circle
            radius={8}
            fill="#1f2937"
            stroke="#374151"
            strokeWidth={1}
          />
          <Text
            text={token.ac?.toString() || '10'}
            fontSize={8}
            fill="#ffffff"
            x={-4}
            y={-3}
            align="center"
            fontStyle="bold"
          />
        </Group>

        {/* HP бар */}
        {token.hp !== undefined && token.maxHp !== undefined && renderHPBar(token)}

        {/* Индикаторы состояний */}
        {token.conditions && token.conditions.length > 0 && renderConditionIndicators(token)}

        {/* Индикатор активного хода */}
        {isActive && (
          <Group x={token.size / 2} y={-25}>
            <Circle
              radius={8}
              fill="#10b981"
              stroke="#ffffff"
              strokeWidth={2}
            />
            <Text
              text="▶"
              fontSize={10}
              fill="#ffffff"
              fontStyle="bold"
              x={-4}
              y={-4}
            />
          </Group>
        )}
      </Group>
    );
  }, [
    activeTokenId, draggedTokenId, hoveredTokenId, selectedToken, isDM,
    handleDragStart, handleDragEnd, handleTokenClick,
    renderHPBar, renderConditionIndicators
  ]);

  // Добавление нового токена
  const addToken = useCallback(() => {
    const newToken: Token = {
      id: `token_${Date.now()}`,
      name: `New Token`,
      x: gridSize * 2,
      y: gridSize * 2,
      color: '#6b7280',
      size: gridSize * 0.9,
      hp: 10,
      maxHp: 10,
      ac: 10,
      speed: 30,
      type: 'monster',
      controlledBy: 'DM',
      tags: []
    };
    
    if (onTokensChange) {
      onTokensChange([...tokens, newToken]);
    } else {
      setInternalTokens(prev => [...prev, newToken]);
    }
    toast({
      title: "Токен добавлен",
      description: "Новый токен создан на карте",
    });
  }, [tokens, onTokensChange, toast, gridSize]);

  // Сохранение токена
  const handleSaveToken = useCallback((updatedToken: Token) => {
    if (onTokensChange) {
      const updatedTokens = tokens.map(token => 
        token.id === updatedToken.id ? updatedToken : token
      );
      onTokensChange(updatedTokens);
    } else {
      setInternalTokens(prev => prev.map(token => 
        token.id === updatedToken.id ? updatedToken : token
      ));
    }
    setEditingToken(null);
    toast({
      title: "Токен обновлен",
      description: `${updatedToken.name} успешно обновлен`,
    });
  }, [tokens, onTokensChange, toast]);

  // Удаление токена
  const handleDeleteToken = useCallback((id: string) => {
    const token = tokens.find(t => t.id === id);
    if (onTokensChange) {
      const filteredTokens = tokens.filter(token => token.id !== id);
      onTokensChange(filteredTokens);
    } else {
      setInternalTokens(prev => prev.filter(token => token.id !== id));
    }
    setEditingToken(null);
    setSelectedToken(null);
    toast({
      title: "Токен удален",
      description: `${token?.name || 'Токен'} удален с карты`,
    });
  }, [tokens, onTokensChange, toast]);

  // Обработка загрузки карты
  const handleMapLoaded = useCallback((imageUrl: string, scale?: number) => {
    setMapImage(imageUrl);
    if (scale) setMapScale(scale);
    if (onMapChange) {
      onMapChange(imageUrl);
    }
    toast({
      title: "Карта загружена",
      description: "Фоновая карта успешно установлена",
    });
  }, [onMapChange, toast]);

  const handleMapRemove = useCallback(() => {
    setMapImage(null);
    if (onMapChange) {
      onMapChange('');
    }
    toast({
      title: "Карта удалена",
      description: "Фоновая карта была удалена",
    });
  }, [onMapChange, toast]);

  const handleTerrainSelect = useCallback((terrain: any) => {
    setSelectedTerrain(terrain);
    toast({
      title: "Элемент выбран",
      description: `Выбран: ${terrain.name}`,
    });
  }, [toast]);

  // Обработка масштабирования карты
  const handleWheel = useCallback((e: any) => {
    e.evt.preventDefault();
    
    const stage = stageRef.current;
    if (!stage) return;
    
    const scaleBy = 1.1;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    
    let newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    newScale = Math.max(0.2, Math.min(3, newScale));
    
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    
    stage.scale({ x: newScale, y: newScale });
    stage.position(newPos);
    stage.batchDraw();
    
    setMapScale(newScale);
    setStagePosition(newPos);
  }, []);

  // Обработчики для панорамирования
  const handleStageMouseDown = useCallback((e: any) => {
    // Только если клик не по токену и зажат пробел или средняя кнопка мыши
    if (e.target === e.target.getStage() && (e.evt.button === 1 || e.evt.ctrlKey)) {
      setIsPanning(true);
    }
  }, []);

  const handleStageMouseMove = useCallback((e: any) => {
    if (!isPanning) return;
    
    const stage = stageRef.current;
    if (!stage) return;

    const dx = e.evt.movementX;
    const dy = e.evt.movementY;
    
    const newPos = {
      x: stage.x() + dx,
      y: stage.y() + dy
    };
    
    stage.position(newPos);
    setStagePosition(newPos);
  }, [isPanning]);

  const handleStageMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  return (
    <div className="w-screen h-screen bg-background text-foreground flex flex-col overflow-hidden fixed inset-0">
      {/* Карта на весь экран */}
      <div className="absolute inset-0 w-full h-full">
        <Stage
          width={windowSize.width}
          height={windowSize.height}
          ref={stageRef}
          className="w-full h-full"
          onWheel={handleWheel}
          onMouseDown={handleStageMouseDown}
          onMouseMove={handleStageMouseMove}
          onMouseUp={handleStageMouseUp}
          scaleX={mapScale}
          scaleY={mapScale}
          x={stagePosition.x}
          y={stagePosition.y}
        >
          <Layer>
            {/* Фон карты */}
            {mapBg ? (
              <Image
                image={mapBg}
                x={0}
                y={0}
                width={windowSize.width}
                height={windowSize.height}
                opacity={0.9}
              />
            ) : (
              <Rect
                x={0}
                y={0}
                width={windowSize.width}
                height={windowSize.height}
                fill="#0f172a"
              />
            )}

            {/* Сетка */}
            {showGrid && (
              <>
                {Array.from({ length: Math.ceil(windowSize.width / gridSize) + 1 }, (_, col) => (
                  <Rect
                    key={`grid-v-${col}`}
                    x={col * gridSize}
                    y={0}
                    width={1}
                    height={windowSize.height}
                    fill={mapBg ? "#ffffff" : "#334155"}
                    opacity={mapBg ? 0.4 : 0.3}
                  />
                ))}
                {Array.from({ length: Math.ceil(windowSize.height / gridSize) + 1 }, (_, row) => (
                  <Rect
                    key={`grid-h-${row}`}
                    x={0}
                    y={row * gridSize}
                    width={windowSize.width}
                    height={1}
                    fill={mapBg ? "#ffffff" : "#334155"}
                    opacity={mapBg ? 0.4 : 0.3}
                  />
                ))}

                {/* Координаты для больших клеток */}
                {gridSize >= 64 && (
                  <>
                    {Array.from({ length: Math.ceil(windowSize.width / gridSize) }, (_, col) => (
                      <Text
                        key={`coord-x-${col}`}
                        text={(col + 1).toString()}
                        fontSize={Math.min(14, gridSize / 6)}
                        fill={mapBg ? "#000000" : "#64748b"}
                        x={col * gridSize + gridSize / 2 - 8}
                        y={8}
                        fontFamily="monospace"
                        fontStyle="bold"
                        stroke={mapBg ? "#ffffff" : "transparent"}
                        strokeWidth={mapBg ? 1 : 0}
                      />
                    ))}
                    {Array.from({ length: Math.ceil(windowSize.height / gridSize) }, (_, row) => (
                      <Text
                        key={`coord-y-${row}`}
                        text={String.fromCharCode(65 + row)}
                        fontSize={Math.min(14, gridSize / 6)}
                        fill={mapBg ? "#000000" : "#64748b"}
                        x={8}
                        y={row * gridSize + gridSize / 2 - 6}
                        fontFamily="monospace"
                        fontStyle="bold"
                        stroke={mapBg ? "#ffffff" : "transparent"}
                        strokeWidth={mapBg ? 1 : 0}
                      />
                    ))}
                  </>
                )}
              </>
            )}

            {/* Токены */}
            {tokens.map(renderToken)}
          </Layer>
          
          {/* Слой тумана войны */}
          {showFogOfWar && isDM && (
            <Layer>
              <FogOfWarLayer
                width={windowSize.width}
                height={windowSize.height}
                gridSize={gridSize}
                visible={showFogOfWar}
                isDM={isDM}
                onVisibilityChange={setFogVisibleAreas}
                initialVisibleAreas={fogVisibleAreas}
              />
            </Layer>
          )}
        </Stage>
        
        {/* Индикатор масштаба */}
        <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm font-medium">
          Масштаб: {Math.round(mapScale * 100)}%
        </div>
        
        {/* Информация внизу */}
        <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm">
          Токенов: {tokens.length} | Размер клетки: {gridSize}px | {isDM ? 'Мастер' : 'Игрок'}
        </div>
      </div>

      {/* Плавающий виджет управления для DM */}
      {isDM && (
        <BattleMapWidget
          showFogOfWar={showFogOfWar}
          onToggleFogOfWar={setShowFogOfWar}
          fogVisibleAreas={fogVisibleAreas}
          onFogAreasChange={setFogVisibleAreas}
          windowSize={windowSize}
          showGrid={showGrid}
          onToggleGrid={setShowGrid}
          gridSize={gridSize}
          onGridSizeChange={setGridSize}
          gridRows={gridRows}
          onGridRowsChange={setGridRows}
          gridCols={gridCols}
          onGridColsChange={setGridCols}
          gridSizes={GRID_SIZES}
          tokensCount={tokens.length}
          onAddToken={addToken}
          onClearTokens={() => {
            if (onTokensChange) {
              onTokensChange([]);
            } else {
              setInternalTokens([]);
            }
            toast({
              title: "Карта очищена",
              description: "Все токены удалены с карты",
            });
          }}
          mapImage={mapImage}
          onMapLoaded={handleMapLoaded}
          onMapRemove={handleMapRemove}
          selectedTerrain={selectedTerrain}
          onTerrainSelect={handleTerrainSelect}
        />
      )}

      {/* Редактор токена */}
      {editingToken && (
        <SimpleTokenEditor
          token={editingToken}
          onSave={handleSaveToken}
          onDelete={() => handleDeleteToken(editingToken.id)}
          onCancel={() => setEditingToken(null)}
        />
      )}
    </div>
  );
};

export default InteractiveBattleMap;