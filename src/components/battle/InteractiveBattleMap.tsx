import React, { useState, useCallback, useRef } from 'react';
import { Stage, Layer, Rect, Text, Group, Circle } from 'react-konva';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Settings, RotateCcw, Zap, Shield, Heart, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SimpleTokenEditor from './SimpleTokenEditor';

const GRID_SIZE = 64; // Размер клетки в пикселях
const ROWS = 12;
const COLS = 16;
const MAP_WIDTH = COLS * GRID_SIZE;
const MAP_HEIGHT = ROWS * GRID_SIZE;

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
}

const InteractiveBattleMap: React.FC<InteractiveBattleMapProps> = ({
  isDM = false,
  tokens: externalTokens,
  onTokensChange,
  activeTokenId,
  onTokenSelect
}) => {
  const { toast } = useToast();
  const stageRef = useRef(null);
  
  const [internalTokens, setInternalTokens] = useState<Token[]>([
    {
      id: 'goblin_scout',
      name: 'Goblin Scout',
      x: GRID_SIZE * 8,
      y: GRID_SIZE * 6,
      color: '#dc2626',
      size: GRID_SIZE * 0.9,
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
      x: GRID_SIZE * 3,
      y: GRID_SIZE * 8,
      color: '#2563eb',
      size: GRID_SIZE * 0.9,
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
      x: GRID_SIZE * 2,
      y: GRID_SIZE * 9,
      color: '#7c3aed',
      size: GRID_SIZE * 0.9,
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

  // Привязка к сетке
  const snapToGrid = useCallback((value: number) => {
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
  }, []);

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
    const boundedX = Math.max(0, Math.min(snappedX, MAP_WIDTH - GRID_SIZE));
    const boundedY = Math.max(0, Math.min(snappedY, MAP_HEIGHT - GRID_SIZE));

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
        description: `${token.name} перемещен на позицию (${Math.floor(boundedX/GRID_SIZE)}, ${Math.floor(boundedY/GRID_SIZE)})`,
      });
    }
  }, [snapToGrid, setTokens, tokens, toast]);

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
          <Shield className="w-3 h-3" />
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
        {renderHPBar(token)}

        {/* Индикаторы состояний */}
        {renderConditionIndicators(token)}

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
      x: GRID_SIZE * 2,
      y: GRID_SIZE * 2,
      color: '#6b7280',
      size: GRID_SIZE * 0.9,
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
  }, [tokens, onTokensChange, toast]);

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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex h-screen">
        {/* Левая панель с инструментами для DM */}
        {isDM && (
          <div className="w-80 bg-card border-r border-border p-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="h-5 w-5" />
                  Управление картой
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={addToken}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить токен
                </Button>
                
                <Button 
                  onClick={() => setShowGrid(!showGrid)}
                  variant="outline"
                  className="w-full"
                >
                  {showGrid ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                  {showGrid ? 'Скрыть сетку' : 'Показать сетку'}
                </Button>

                <Button 
                  onClick={() => {
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
                  variant="destructive"
                  className="w-full"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Очистить карту
                </Button>
              </CardContent>
            </Card>

            {/* Список токенов */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Токены ({tokens.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                {tokens.map(token => (
                  <div 
                    key={token.id}
                    className={`p-3 rounded-lg cursor-pointer border transition-colors ${
                      selectedToken?.id === token.id 
                        ? 'bg-primary/10 border-primary' 
                        : 'bg-muted border-border hover:bg-muted/80'
                    }`}
                    onClick={() => handleTokenClick(token)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full border-2 border-white"
                          style={{ backgroundColor: token.color }}
                        />
                        <span className="text-sm font-medium">{token.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground capitalize">{token.type}</span>
                    </div>
                    {token.hp !== undefined && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        HP: {token.hp}/{token.maxHp} • AC: {token.ac}
                      </div>
                    )}
                    {token.conditions && token.conditions.length > 0 && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        Состояния: {token.conditions.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Основная область карты */}
        <div className="flex-1 overflow-auto bg-muted/20 p-4">
          <div className="border border-border rounded-lg overflow-hidden bg-card">
            <Stage
              width={MAP_WIDTH}
              height={MAP_HEIGHT}
              ref={stageRef}
              className="cursor-crosshair"
            >
              <Layer>
                {/* Фон карты */}
                <Rect
                  x={0}
                  y={0}
                  width={MAP_WIDTH}
                  height={MAP_HEIGHT}
                  fill="#0f172a"
                />

                {/* Сетка */}
                {showGrid && (
                  <>
                    {Array.from({ length: COLS + 1 }, (_, col) => (
                      <Rect
                        key={`grid-v-${col}`}
                        x={col * GRID_SIZE}
                        y={0}
                        width={1}
                        height={MAP_HEIGHT}
                        fill="#334155"
                        opacity={0.3}
                      />
                    ))}
                    {Array.from({ length: ROWS + 1 }, (_, row) => (
                      <Rect
                        key={`grid-h-${row}`}
                        x={0}
                        y={row * GRID_SIZE}
                        width={MAP_WIDTH}
                        height={1}
                        fill="#334155"
                        opacity={0.3}
                      />
                    ))}

                    {/* Координаты */}
                    {Array.from({ length: COLS }, (_, col) => (
                      <Text
                        key={`coord-x-${col}`}
                        text={(col + 1).toString()}
                        fontSize={12}
                        fill="#64748b"
                        x={col * GRID_SIZE + GRID_SIZE / 2 - 6}
                        y={4}
                        fontFamily="monospace"
                      />
                    ))}
                    {Array.from({ length: ROWS }, (_, row) => (
                      <Text
                        key={`coord-y-${row}`}
                        text={String.fromCharCode(65 + row)} // A, B, C...
                        fontSize={12}
                        fill="#64748b"
                        x={4}
                        y={row * GRID_SIZE + GRID_SIZE / 2 - 6}
                        fontFamily="monospace"
                      />
                    ))}
                  </>
                )}

                {/* Токены */}
                {tokens.map(renderToken)}
              </Layer>
            </Stage>
          </div>
        </div>
      </div>

      {/* Статистика карты */}
      <div className="px-4 py-2 bg-card border-t border-border flex justify-between text-sm text-muted-foreground">
        <span>Размер: {COLS}×{ROWS} клеток ({GRID_SIZE}px/клетка)</span>
        <span>Токенов на карте: {tokens.length}</span>
        <span>Режим: {isDM ? 'Мастер подземелий' : 'Игрок'}</span>
      </div>

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