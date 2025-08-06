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
  
  // Временно задаем ID пользователя (в будущем из auth context)
  const currentUserId = 'Player1'; // TODO: получать из useAuth()
  
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

  // Используем только внутреннее состояние для гарантированного обновления
  const [currentTokens, setCurrentTokens] = useState<Token[]>(externalTokens || internalTokens);
  
  // Синхронизируем с внешними токенами при их изменении
  useEffect(() => {
    if (externalTokens) {
      setCurrentTokens(externalTokens);
    }
  }, [externalTokens]);

  const tokens = currentTokens;

  const [draggedTokenId, setDraggedTokenId] = useState<string | null>(null);
  const [hoveredTokenId, setHoveredTokenId] = useState<string | null>(null);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [editingToken, setEditingToken] = useState<Token | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [gridSize, setGridSize] = useState(DEFAULT_GRID_SIZE);
  const [gridRows, setGridRows] = useState(20);
  const [gridCols, setGridCols] = useState(24);
  const [mapImage, setMapImage] = useState<string | null>(mapImageUrl || null);
  const [mapScale, setMapScale] = useState(100);
  const [selectedTerrain, setSelectedTerrain] = useState(null);
  const [activeTab, setActiveTab] = useState('tokens');
  const [windowSize, setWindowSize] = useState({ width: 1920, height: 1080 });
  const [errorLog, setErrorLog] = useState<string[]>([]);
  
  // Функция для добавления ошибок в лог
  const addError = useCallback((message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    const errorMessage = `[${timestamp}] ${message}`;
    console.error('🚨 DRAG ERROR:', errorMessage, data);
    setErrorLog(prev => [...prev.slice(-9), errorMessage]); // Держим последние 10 ошибок
  }, []);
  
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

  // Привязка к сетке - более точная
  const snapToGrid = useCallback((value: number) => {
    const cellCenter = gridSize / 2;
    const cellIndex = Math.round((value - cellCenter) / gridSize);
    return cellIndex * gridSize + cellCenter;
  }, [gridSize]);

  // Отладочные функции для мыши с безопасной проверкой
  const logMouseEvent = useCallback((event: string, e: any, tokenId?: string) => {
    try {
      const mousePos = e.evt ? { x: e.evt.clientX || 0, y: e.evt.clientY || 0 } : { x: 0, y: 0 };
      const stagePos = e.target?.getStage?.()?.getPointerPosition?.() || { x: 0, y: 0 };
      const button = e.evt?.button !== undefined ? e.evt.button : 'unknown';
      
      console.log(`🖱️ MOUSE ${event.toUpperCase()}:`, {
        tokenId,
        button,
        clientPos: mousePos,
        stagePos,
        timestamp: Date.now(),
        type: e.evt?.type || 'drag_event',
        hasEvt: !!e.evt
      });
    } catch (error) {
      console.log(`🖱️ MOUSE ${event.toUpperCase()} ERROR:`, error, { tokenId, eventObject: e });
    }
  }, []);

  // Глобальные обработчики мыши для отладки
  useEffect(() => {
    const handleGlobalMouseDown = (e: MouseEvent) => {
      console.log('🖱️ GLOBAL MOUSE DOWN:', {
        button: e.button,
        clientX: e.clientX,
        clientY: e.clientY,
        timestamp: Date.now()
      });
    };

    const handleGlobalMouseUp = (e: MouseEvent) => {
      console.log('🖱️ GLOBAL MOUSE UP:', {
        button: e.button,
        clientX: e.clientX,
        clientY: e.clientY,
        timestamp: Date.now()
      });
    };

    document.addEventListener('mousedown', handleGlobalMouseDown);
    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mousedown', handleGlobalMouseDown);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  // Обработчики Drag & Drop с детальным error logging
  const handleDragStart = useCallback((tokenId: string, e: any) => {
    try {
      logMouseEvent('drag_start', e, tokenId);
      console.log('🎯 DRAG START - BEGIN for token:', tokenId);
      
      const token = tokens.find(t => t.id === tokenId);
      if (!token) {
        addError(`Token not found: ${tokenId}`, { availableTokens: tokens.map(t => t.id) });
        return;
      }
      
      console.log('🎯 DRAG START TOKEN:', {
        id: tokenId,
        currentPos: { x: token.x, y: token.y },
        canDrag: isDM || token.controlledBy === currentUserId,
        isDM,
        controlledBy: token.controlledBy,
        currentUserId,
        currentDraggedTokenId: draggedTokenId
      });
      
      // Проверяем права доступа
      if (!isDM && token.controlledBy !== currentUserId) {
        addError(`Access denied for token: ${tokenId}`, { 
          isDM, 
          tokenControlledBy: token.controlledBy, 
          currentUserId 
        });
        toast({
          title: "Нет доступа",
          description: "Вы можете перемещать только своих персонажей",
          variant: "destructive"
        });
        e.evt?.preventDefault?.();
        return;
      }
      
      console.log('✅ DRAG ALLOWED - setting dragged token to:', tokenId);
      setDraggedTokenId(tokenId);
      console.log('🎯 DRAG START - END for token:', tokenId);
      
    } catch (error) {
      addError('Exception in handleDragStart', { error: error.message, tokenId, stack: error.stack });
    }
  }, [isDM, tokens, toast, currentUserId, logMouseEvent, addError, draggedTokenId]);

  const handleDragEnd = useCallback((tokenId: string, newX: number, newY: number, e: any) => {
    try {
      logMouseEvent('drag_end', e, tokenId);
      console.log('🎯 DRAG END - BEGIN for token:', tokenId);
      
      console.log('🎯 DRAG END STATE CHECK:', {
        receivedTokenId: tokenId,
        currentDraggedTokenId: draggedTokenId,
        newPos: { x: newX, y: newY },
        gridSize,
        tokensCount: tokens.length,
        allTokenIds: tokens.map(t => t.id),
        timestamp: Date.now()
      });
      
      // Проверяем, что токен действительно перетаскивался
      if (draggedTokenId !== tokenId) {
        console.error('🚨 DRAG MISMATCH DETECTED:', {
          expected: draggedTokenId,
          received: tokenId,
          tokensOnMap: tokens.map(t => ({ id: t.id, name: t.name })),
          timestamp: Date.now()
        });
        addError(`Drag mismatch: expected ${draggedTokenId}, got ${tokenId}`);
        
        // Принудительно сбрасываем состояние для предотвращения дальнейших ошибок
        console.log('🔄 FORCE RESET draggedTokenId to null');
        setDraggedTokenId(null);
        return;
      }
      
      // Проверяем минимальное движение
      const currentToken = tokens.find(t => t.id === tokenId);
      if (!currentToken) {
        addError(`Token not found during drag end: ${tokenId}`, { 
          availableTokens: tokens.map(t => t.id) 
        });
        return;
      }
      
      const deltaX = Math.abs(newX - currentToken.x);
      const deltaY = Math.abs(newY - currentToken.y);
      const minMovement = 5; // Минимальное движение в пикселях
      
      console.log('📏 MOVEMENT CHECK:', {
        oldPos: { x: currentToken.x, y: currentToken.y },
        newPos: { x: newX, y: newY },
        delta: { x: deltaX, y: deltaY },
        minMovement,
        willMove: deltaX >= minMovement || deltaY >= minMovement
      });
      
      if (deltaX < minMovement && deltaY < minMovement) {
        console.log('⚠️ MOVEMENT TOO SMALL - ignoring');
        setDraggedTokenId(null);
        return;
      }
      
      const snappedX = snapToGrid(newX);
      const snappedY = snapToGrid(newY);
      
      console.log('📐 SNAP TO GRID:', {
        original: { x: newX, y: newY },
        snapped: { x: snappedX, y: snappedY }
      });
      
      // Проверяем границы карты
      const mapWidth = gridCols * gridSize;
      const mapHeight = gridRows * gridSize;
      const boundedX = Math.max(gridSize/2, Math.min(snappedX, mapWidth - gridSize/2));
      const boundedY = Math.max(gridSize/2, Math.min(snappedY, mapHeight - gridSize/2));

      console.log('🗺️ BOUNDS CHECK:', {
        mapSize: { width: mapWidth, height: mapHeight },
        snapped: { x: snappedX, y: snappedY },
        bounded: { x: boundedX, y: boundedY }
      });

      // Создаем полностью новый массив токенов для принудительного обновления
      const oldTokensLength = tokens.length;
      const updatedTokens = tokens.map(token => 
        token.id === tokenId 
          ? { ...token, x: boundedX, y: boundedY }
          : token
      );
      
      console.log('🔄 UPDATING TOKENS:', {
        tokenId,
        oldToken: tokens.find(t => t.id === tokenId),
        newToken: updatedTokens.find(t => t.id === tokenId),
        oldLength: oldTokensLength,
        newLength: updatedTokens.length,
        sameLength: oldTokensLength === updatedTokens.length
      });

      // Проверяем, что обновление прошло корректно
      const updatedToken = updatedTokens.find(t => t.id === tokenId);
      if (!updatedToken) {
        addError(`Token lost after update: ${tokenId}`);
        return;
      }
      
      if (updatedToken.x !== boundedX || updatedToken.y !== boundedY) {
        addError(`Position update failed`, {
          expected: { x: boundedX, y: boundedY },
          actual: { x: updatedToken.x, y: updatedToken.y }
        });
        return;
      }

      console.log('📝 CALLING STATE UPDATES');
      
      // Принудительно обновляем состояние
      setCurrentTokens([...updatedTokens]); // Создаем новую ссылку на массив
      
      // Если есть внешний обработчик, тоже его вызываем
      if (onTokensChange) {
        console.log('📝 CALLING EXTERNAL onTokensChange');
        onTokensChange([...updatedTokens]);
      }
      
      setDraggedTokenId(null);
      
      console.log('📝 STATE UPDATES COMPLETED');
      
      const token = tokens.find(t => t.id === tokenId);
      if (token) {
        toast({
          title: "Токен перемещен",
          description: `${token.name} перемещен на позицию (${Math.floor(boundedX/gridSize)}, ${Math.floor(boundedY/gridSize)})`,
        });
      }
      
      console.log('✅ DRAG COMPLETED SUCCESSFULLY');
      console.log('🎯 DRAG END - END');
      
    } catch (error) {
      addError('Exception in handleDragEnd', { 
        error: error.message, 
        tokenId, 
        newX, 
        newY,
        stack: error.stack 
      });
    }
  }, [snapToGrid, tokens, onTokensChange, toast, gridCols, gridRows, gridSize, logMouseEvent, addError, draggedTokenId]);

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

  // Компонент токена с поддержкой аватаров
  const TokenWithAvatar = ({ token }: { token: Token }) => {
    const [avatarImage] = useImage(token.avatar || '');
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

    console.log(`Rendering token ${token.id} at position:`, token.x, token.y);

    return (
      <Group
        key={`${token.id}-${token.x}-${token.y}`} // Принудительный перерендер при изменении позиции
        x={token.x}
        y={token.y}
        draggable={isDM || token.controlledBy === currentUserId}
        onDragStart={(e) => {
          try {
            logMouseEvent('token_drag_start', e, token.id);
            console.log('🎯 TOKEN DRAG START EVENT:', token.id, 'current pos:', token.x, token.y);
            
            // Проверяем права доступа перед началом перетаскивания
            if (!isDM && token.controlledBy !== currentUserId) {
              console.log('❌ PREVENTING DRAG - no access');
              addError(`Drag prevented - no access to token: ${token.id}`);
              e.evt?.preventDefault?.();
              return;
            }
            
            handleDragStart(token.id, e);
          } catch (error) {
            addError('Exception in onDragStart', { error: error.message, tokenId: token.id });
          }
        }}
        onDragMove={(e) => {
          try {
            // Убираем реалтайм обновления - они мешают корректному drag & drop
            console.log('🔄 TOKEN DRAG MOVE:', token.id, 'pos:', e.target.x(), e.target.y());
          } catch (error) {
            addError('Exception in onDragMove', { error: error.message, tokenId: token.id });
          }
        }}
        onDragEnd={(e) => {
          try {
            logMouseEvent('token_drag_end', e, token.id);
            console.log('🎯 TOKEN DRAG END EVENT:', token.id, 'target pos:', e.target.x(), e.target.y());
            
            // Проверяем права доступа
            if (!isDM && token.controlledBy !== currentUserId) {
              console.log('❌ NO ACCESS TO END DRAG');
              addError(`Drag end prevented - no access to token: ${token.id}`);
              return;
            }
            
            handleDragEnd(token.id, e.target.x(), e.target.y(), e);
          } catch (error) {
            addError('Exception in onDragEnd', { error: error.message, tokenId: token.id });
          }
        }}
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
        
        {/* Основной токен - изображение или цветной круг */}
        {avatarImage ? (
          <>
            {/* Круглая маска для изображения */}
            <Circle
              x={token.size / 2}
              y={token.size / 2}
              radius={(token.size / 2) - 4}
              fill={token.color}
              stroke={isSelected ? "#fbbf24" : isActive ? "#10b981" : getTypeColor(token.type)}
              strokeWidth={isSelected ? 4 : isActive ? 3 : 2}
            />
            <Image
              x={4}
              y={4}
              width={token.size - 8}
              height={token.size - 8}
              image={avatarImage}
              cornerRadius={(token.size / 2) - 4}
              clipFunc={(ctx) => {
                ctx.arc(token.size / 2, token.size / 2, (token.size / 2) - 4, 0, Math.PI * 2, false);
              }}
            />
          </>
        ) : (
          <Circle
            x={token.size / 2}
            y={token.size / 2}
            radius={(token.size / 2) - 4}
            fill={token.color}
            stroke={isSelected ? "#fbbf24" : isActive ? "#10b981" : getTypeColor(token.type)}
            strokeWidth={isSelected ? 4 : isActive ? 3 : 2}
          />
        )}

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
        {token.hp !== undefined && token.maxHp !== undefined && (
          <Group x={0} y={-12}>
            <Rect
              x={2}
              y={0}
              width={token.size - 4}
              height={6}
              fill="#374151"
              cornerRadius={3}
            />
            <Rect
              x={2}
              y={0}
              width={((token.hp / token.maxHp) * (token.size - 4))}
              height={6}
              fill={token.hp > token.maxHp * 0.5 ? "#10b981" : token.hp > token.maxHp * 0.25 ? "#f59e0b" : "#ef4444"}
              cornerRadius={3}
            />
            <Text
              text={`${token.hp}/${token.maxHp}`}
              fontSize={8}
              fill="#ffffff"
              x={2}
              y={-1}
              width={token.size - 4}
              align="center"
              fontStyle="bold"
            />
          </Group>
        )}

        {/* Статусы и условия */}
        {token.conditions && token.conditions.length > 0 && (
          <Group x={-12} y={token.size - 20}>
            {token.conditions.slice(0, 3).map((condition, index) => (
              <Group key={condition} x={index * 14} y={0}>
                <Circle
                  radius={6}
                  fill={getConditionColor(condition)}
                  stroke="#000000"
                  strokeWidth={1}
                />
                <Text
                  text={getConditionIcon(condition)}
                  fontSize={8}
                  fill="#ffffff"
                  x={-3}
                  y={-3}
                  align="center"
                />
              </Group>
            ))}
          </Group>
        )}
      </Group>
    );
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
        onDragStart={(e) => handleDragStart(token.id, e)}
        onDragEnd={(e) => handleDragEnd(token.id, e.target.x(), e.target.y(), e)}
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
    // Находим свободное место для нового токена
    const findFreePosition = () => {
      const tokenPositions = tokens.map(t => ({ x: t.x, y: t.y }));
      const cellSize = gridSize;
      
      // Начинаем поиск с центра карты
      const startX = Math.floor(gridCols / 2) * cellSize;
      const startY = Math.floor(gridRows / 2) * cellSize;
      
      // Проверяем позиции по спирали от центра
      for (let radius = 0; radius < Math.max(gridCols, gridRows) / 2; radius++) {
        for (let angle = 0; angle < 360; angle += 45) {
          const rad = (angle * Math.PI) / 180;
          const x = startX + Math.cos(rad) * radius * cellSize;
          const y = startY + Math.sin(rad) * radius * cellSize;
          
          // Проверяем, что позиция в пределах карты
          if (x >= cellSize/2 && x < gridCols * cellSize - cellSize/2 && 
              y >= cellSize/2 && y < gridRows * cellSize - cellSize/2) {
            
            // Проверяем, что позиция не занята другим токеном
            const isOccupied = tokenPositions.some(pos => 
              Math.abs(pos.x - x) < cellSize * 0.8 && 
              Math.abs(pos.y - y) < cellSize * 0.8
            );
            
            if (!isOccupied) {
              return { x, y };
            }
          }
        }
      }
      
      // Если не нашли свободное место, ставим в случайную позицию
      return {
        x: (Math.floor(Math.random() * (gridCols - 2)) + 1) * cellSize,
        y: (Math.floor(Math.random() * (gridRows - 2)) + 1) * cellSize
      };
    };
    
    const position = findFreePosition();
    
    const newToken: Token = {
      id: `token_${Date.now()}`,
      name: `New Token`,
      x: position.x,
      y: position.y,
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
    
    const updatedTokens = [...tokens, newToken];
    
    // Принудительно обновляем состояние с новой ссылкой на массив
    setCurrentTokens([...updatedTokens]);
    
    if (onTokensChange) {
      onTokensChange([...updatedTokens]);
    }
    
    toast({
      title: "Токен добавлен",
      description: "Новый токен создан на карте",
    });
  }, [tokens, onTokensChange, toast, gridSize, gridCols, gridRows]);

  // Сохранение токена
  const handleSaveToken = useCallback((updatedToken: Token) => {
    console.log('Saving token:', updatedToken);
    const updatedTokens = tokens.map(token => 
      token.id === updatedToken.id ? { ...updatedToken } : token
    );
    
    // Принудительно обновляем состояние с новой ссылкой на массив
    setCurrentTokens([...updatedTokens]);
    
    if (onTokensChange) {
      onTokensChange([...updatedTokens]);
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
    const filteredTokens = tokens.filter(token => token.id !== id);
    
    // Принудительно обновляем состояние с новой ссылкой на массив
    setCurrentTokens([...filteredTokens]);
    
    if (onTokensChange) {
      onTokensChange([...filteredTokens]);
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

  return (
    <div className="w-screen h-screen bg-background text-foreground flex flex-col overflow-hidden fixed inset-0">
      {/* Компактная боковая панель управления для DM */}
      {isDM && (
        <div className="fixed left-0 top-0 h-full w-80 bg-card border-r border-border shadow-lg z-20 overflow-y-auto">
          <div className="p-4">
            <h1 className="text-lg font-bold mb-4">Панель мастера</h1>
            
            {/* Основные кнопки управления */}
            <div className="space-y-2 mb-4">
              <Button 
                onClick={() => setShowGrid(!showGrid)}
                variant={showGrid ? "default" : "outline"}
                size="sm"
                className="w-full justify-start"
              >
                {showGrid ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {showGrid ? 'Скрыть сетку' : 'Показать сетку'}
              </Button>
              
              <Button 
                onClick={addToken}
                size="sm"
                className="w-full justify-start"
              >
                <Plus className="w-4 h-4 mr-2" />
                Добавить токен
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
                size="sm"
                className="w-full justify-start"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Очистить карту
              </Button>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="tokens">Токены</TabsTrigger>
                <TabsTrigger value="settings">Настройки</TabsTrigger>
              </TabsList>
              
              <div className="mt-4">
                <TabsContent value="tokens" className="mt-0 space-y-2">
                  <h3 className="font-medium mb-2">Активные токены ({tokens.length})</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                     {tokens.map(token => (
                       <div 
                         key={token.id}
                         className={`p-3 rounded border cursor-pointer transition-colors group ${
                           selectedToken?.id === token.id 
                             ? 'bg-primary/10 border-primary' 
                             : 'bg-muted border-border hover:bg-muted/80'
                         }`}
                         onClick={() => handleTokenClick(token)}
                       >
                         <div className="flex items-center gap-2">
                           <div 
                             className="w-4 h-4 rounded-full border-2 border-white flex-shrink-0"
                             style={{ backgroundColor: token.color }}
                           />
                           <div className="flex-1 min-w-0">
                             <div className="font-medium text-sm truncate">{token.name}</div>
                             <div className="text-xs text-muted-foreground">
                               HP: {token.hp}/{token.maxHp} | AC: {token.ac}
                             </div>
                             <div className="text-xs text-muted-foreground">
                               {token.type} | Позиция: ({Math.floor(token.x/gridSize)}, {Math.floor(token.y/gridSize)})
                             </div>
                           </div>
                           <Button
                             size="sm"
                             variant="destructive"
                             onClick={(e) => {
                               e.stopPropagation();
                               handleDeleteToken(token.id);
                             }}
                             className="opacity-0 group-hover:opacity-100 transition-opacity"
                           >
                             ×
                           </Button>
                         </div>
                       </div>
                     ))}
                    {tokens.length === 0 && (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        Нет токенов на карте
                       </div>
                     )}
                   </div>
                   
                   {/* Error Log Panel - показываем только если есть ошибки */}
                   {errorLog.length > 0 && (
                     <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded">
                       <h4 className="text-red-400 font-semibold mb-2">🚨 Ошибки перемещения:</h4>
                       <div className="text-xs text-red-300 space-y-1 max-h-32 overflow-y-auto">
                         {errorLog.slice(-5).map((error, i) => (
                           <div key={i}>{error}</div>
                         ))}
                       </div>
                       <Button 
                         size="sm" 
                         variant="ghost" 
                         onClick={() => setErrorLog([])}
                         className="mt-2 text-red-400 hover:text-red-300"
                       >
                         Очистить лог
                       </Button>
                     </div>
                   )}
                 </TabsContent>
                
                <TabsContent value="settings" className="mt-0 space-y-4">
                  {/* Настройки сетки */}
                  <div className="space-y-3">
                    <h3 className="font-medium">Настройки сетки</h3>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Размер клетки:</label>
                      <div className="grid grid-cols-2 gap-1">
                        {GRID_SIZES.map(size => (
                          <Button
                            key={size}
                            variant={gridSize === size ? 'default' : 'outline'}
                            onClick={() => setGridSize(size)}
                            size="sm"
                          >
                            {size}px
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-sm font-medium">Строки:</label>
                        <input
                          type="number"
                          value={gridRows}
                          onChange={(e) => setGridRows(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full px-2 py-1 border border-border rounded bg-background text-sm"
                          min="1"
                          max="50"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Столбцы:</label>
                        <input
                          type="number"
                          value={gridCols}
                          onChange={(e) => setGridCols(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full px-2 py-1 border border-border rounded bg-background text-sm"
                          min="1"
                          max="50"
                        />
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      Размер карты: {gridCols * gridSize}×{gridRows * gridSize}px
                    </div>
                  </div>
                  
                  {/* Загрузка карты */}
                  <div className="space-y-3">
                    <h3 className="font-medium">Фоновая карта</h3>
                    <MapUploader
                      onMapLoaded={handleMapLoaded}
                      currentMapUrl={mapImage}
                      onMapRemove={handleMapRemove}
                    />
                  </div>
                  
                  {/* Элементы ландшафта */}
                  <div className="space-y-3">
                    <h3 className="font-medium">Ландшафт</h3>
                    <TerrainPalette
                      onElementSelect={handleTerrainSelect}
                      selectedElement={selectedTerrain}
                    />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      )}

      {/* Карта на весь экран с отступом для боковой панели */}
      <div className="absolute inset-0 w-full h-full" style={{ 
        left: isDM ? '320px' : '0px',
        top: '0px',
        right: '0px', 
        bottom: '0px'
      }}>
        <Stage
          width={isDM ? windowSize.width - 320 : windowSize.width}
          height={windowSize.height}
          ref={stageRef}
          className="w-full h-full"
        >
          <Layer>
            {/* Фон карты */}
            {mapBg ? (
              <Image
                image={mapBg}
                x={0}
                y={0}
                width={isDM ? windowSize.width - 320 : windowSize.width}
                height={windowSize.height}
                opacity={0.9}
              />
            ) : (
              <Rect
                x={0}
                y={0}
                width={isDM ? windowSize.width - 320 : windowSize.width}
                height={windowSize.height}
                fill="#0f172a"
              />
            )}

            {/* Сетка */}
            {showGrid && (
              <>
                {Array.from({ length: Math.ceil((isDM ? windowSize.width - 320 : windowSize.width) / gridSize) + 1 }, (_, col) => (
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
                    width={isDM ? windowSize.width - 320 : windowSize.width}
                    height={1}
                    fill={mapBg ? "#ffffff" : "#334155"}
                    opacity={mapBg ? 0.4 : 0.3}
                  />
                ))}

                {/* Координаты для больших клеток */}
                {gridSize >= 64 && (
                  <>
                    {Array.from({ length: Math.ceil((isDM ? windowSize.width - 320 : windowSize.width) / gridSize) }, (_, col) => (
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
            {tokens.map(token => (
              <TokenWithAvatar key={`${token.id}-${token.x}-${token.y}`} token={token} />
            ))}
          </Layer>
        </Stage>
        
        {/* Индикатор масштаба */}
        {mapImage && (
          <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm font-medium">
            Масштаб: {mapScale}%
          </div>
        )}
        
        {/* Информация внизу */}
        <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm">
          Токенов: {tokens.length} | Размер клетки: {gridSize}px | {isDM ? 'Мастер' : 'Игрок'}
        </div>
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