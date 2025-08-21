// Компонент для отрисовки тумана войны
import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useFogOfWarStore } from '@/stores/fogOfWarStore';
import { useUnifiedBattleStore } from '@/stores/unifiedBattleStore';
import { ContextMenu } from './ContextMenu';

interface FogOfWarCanvasProps {
  mapWidth: number;
  mapHeight: number;
  mapScale: number;
  mapOffset: { x: number; y: number };
}

export const FogOfWarCanvas: React.FC<FogOfWarCanvasProps> = ({
  mapWidth,
  mapHeight,
  mapScale,
  mapOffset
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { 
    fogGrid, 
    gridWidth, 
    gridHeight, 
    cellSize, 
    spawnPoints,
    isInitialized,
    initializeFog,
    lastUpdated
  } = useFogOfWarStore();
  
  const { isDM } = useUnifiedBattleStore();
  const playerViewCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // Состояние для контекстного меню
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    mapX: number;
    mapY: number;
    clickedSpawn?: any;
  }>({
    visible: false,
    x: 0,
    y: 0,
    mapX: 0,
    mapY: 0
  });

  // Состояние для перетаскивания точек спавна
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    spawnId: string | null;
    offset: { x: number; y: number };
  }>({
    isDragging: false,
    spawnId: null,
    offset: { x: 0, y: 0 }
  });

  // Константы для размеров (5 фит = 1 квадратик = 32 пикселя при стандартном масштабе)
  const GRID_SIZE = 32; // размер одной клетки в пикселях
  const SPAWN_SIZE = GRID_SIZE; // точка спавна = 1 квадратик
  
  // Инициализация тумана при монтировании компонента
  useEffect(() => {
    console.log('🌫️ FogOfWarCanvas mounted, isInitialized:', isInitialized);
    console.log('🌫️ fogGrid:', fogGrid.length, 'gridWidth:', gridWidth, 'gridHeight:', gridHeight);
    
    if (!isInitialized) {
      console.log('🌫️ Инициализируем туман войны, mapWidth:', mapWidth, 'mapHeight:', mapHeight);
      initializeFog(mapWidth, mapHeight, 32);
    }
  }, []);

  // Инициализация тумана при первой загрузке
  useEffect(() => {
    console.log('🌫️ FogOfWarCanvas effect - isInitialized:', isInitialized, 'fogGrid length:', fogGrid.length);
    if (!isInitialized && mapWidth > 0 && mapHeight > 0) {
      console.log('🌫️ Инициализируем туман войны с размерами:', mapWidth, 'x', mapHeight);
      initializeFog(mapWidth, mapHeight, 32);
    }
  }, [isInitialized, mapWidth, mapHeight, initializeFog]);
  
  // Отрисовка тумана
  const drawFog = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !fogGrid.length) {
      console.log('🌫️ drawFog: canvas или fogGrid отсутствуют, canvas:', !!canvas, 'fogGrid length:', fogGrid.length);
      return;
    }
    
    console.log('🌫️ Отрисовываем туман, grid:', gridWidth, 'x', gridHeight, 'cells with fog:', 
      fogGrid.flat().filter(cell => cell === 0).length, 'revealed:', fogGrid.flat().filter(cell => cell === 1).length);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Настраиваем канвас
    canvas.width = mapWidth;
    canvas.height = mapHeight;
    
    // Очищаем канвас
    ctx.clearRect(0, 0, mapWidth, mapHeight);
    
    // Рисуем туман (темные области для неизведанных клеток)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)'; // Более темный туман для лучшей видимости
    
    let foggyCells = 0;
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        if (fogGrid[y][x] === 0) { // Закрыто туманом
          const worldX = x * cellSize;
          const worldY = y * cellSize;
          
          ctx.fillRect(worldX, worldY, cellSize, cellSize);
          foggyCells++;
        }
      }
    }
    
    console.log('🌫️ Нарисовано', foggyCells, 'туманных клеток');
    
    // Рисуем точки спавна для ДМ
    if (isDM) {
      spawnPoints.forEach((spawn, index) => {
        const isBeingDragged = dragState.isDragging && dragState.spawnId === spawn.id;
        const size = SPAWN_SIZE;
        const halfSize = size / 2;
        
        // Привязка к сетке (snap to grid)
        const gridX = Math.round(spawn.x / GRID_SIZE) * GRID_SIZE;
        const gridY = Math.round(spawn.y / GRID_SIZE) * GRID_SIZE;
        
        const x = isBeingDragged ? spawn.x : gridX;
        const y = isBeingDragged ? spawn.y : gridY;
        
        // Фон точки спавна (квадрат 32x32 пикселя = 5 фит)
        ctx.fillStyle = spawn.playerId 
          ? (isBeingDragged ? 'rgba(34, 197, 94, 0.9)' : 'rgba(34, 197, 94, 0.7)')
          : (isBeingDragged ? 'rgba(59, 130, 246, 0.9)' : 'rgba(59, 130, 246, 0.7)');
        ctx.fillRect(x - halfSize, y - halfSize, size, size);
        
        // Обводка
        ctx.strokeStyle = spawn.playerId ? '#22c55e' : '#3b82f6';
        ctx.lineWidth = isBeingDragged ? 3 : 2;
        ctx.strokeRect(x - halfSize, y - halfSize, size, size);
        
        // Если перетаскивается, показываем направляющие к сетке
        if (isBeingDragged) {
          ctx.setLineDash([4, 4]);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.lineWidth = 1;
          ctx.strokeRect(gridX - halfSize, gridY - halfSize, size, size);
          ctx.setLineDash([]);
        }
        
        // Номер точки
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText((index + 1).toString(), x, y + 5);
        
        // Показываем размер клетки (5 фит)
        if (isBeingDragged) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.fillRect(x - halfSize, y + halfSize + 2, size, 16);
          ctx.fillStyle = 'white';
          ctx.font = '10px Arial';
          ctx.fillText('5 ft', x, y + halfSize + 12);
        }
      });
    }
  }, [fogGrid, gridWidth, gridHeight, cellSize, mapWidth, mapHeight, spawnPoints, isDM, dragState]);
  
  // Перерисовка при изменениях
  useEffect(() => {
    drawFog();
  }, [drawFog, lastUpdated]);

  // Функция для определения клика по точке спавна
  const getClickedSpawnPoint = useCallback((x: number, y: number) => {
    const halfSize = SPAWN_SIZE / 2;
    return spawnPoints.find(spawn => {
      const gridX = Math.round(spawn.x / GRID_SIZE) * GRID_SIZE;
      const gridY = Math.round(spawn.y / GRID_SIZE) * GRID_SIZE;
      
      return x >= gridX - halfSize && x <= gridX + halfSize &&
             y >= gridY - halfSize && y <= gridY + halfSize;
    });
  }, [spawnPoints, GRID_SIZE, SPAWN_SIZE]);

  // Обработчик начала перетаскивания
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDM || e.button !== 0) return; // Только левая кнопка мыши
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / mapScale - mapOffset.x / mapScale;
    const y = (e.clientY - rect.top) / mapScale - mapOffset.y / mapScale;
    
    const clickedSpawn = getClickedSpawnPoint(x, y);
    if (clickedSpawn) {
      setDragState({
        isDragging: true,
        spawnId: clickedSpawn.id,
        offset: {
          x: x - clickedSpawn.x,
          y: y - clickedSpawn.y
        }
      });
      e.preventDefault();
    }
  }, [isDM, mapScale, mapOffset, getClickedSpawnPoint]);

  // Обработчик движения мыши (перетаскивание)
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragState.isDragging || !dragState.spawnId) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / mapScale - mapOffset.x / mapScale;
    const y = (e.clientY - rect.top) / mapScale - mapOffset.y / mapScale;
    
    // Обновляем позицию точки спавна
    const newX = x - dragState.offset.x;
    const newY = y - dragState.offset.y;
    
    useFogOfWarStore.getState().updateSpawnPoint(dragState.spawnId, { x: newX, y: newY });
  }, [dragState, mapScale, mapOffset]);

  // Обработчик окончания перетаскивания
  const handleMouseUp = useCallback(() => {
    if (dragState.isDragging && dragState.spawnId) {
      // Привязываем к сетке при завершении перетаскивания
      const spawn = spawnPoints.find(s => s.id === dragState.spawnId);
      if (spawn) {
        const gridX = Math.round(spawn.x / GRID_SIZE) * GRID_SIZE;
        const gridY = Math.round(spawn.y / GRID_SIZE) * GRID_SIZE;
        useFogOfWarStore.getState().updateSpawnPoint(dragState.spawnId, { x: gridX, y: gridY });
      }
    }
    
    setDragState({
      isDragging: false,
      spawnId: null,
      offset: { x: 0, y: 0 }
    });
  }, [dragState, spawnPoints, GRID_SIZE]);

  // Обработчик правого клика для показа контекстного меню
  const handleContextMenu = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDM) return;
    
    e.preventDefault();
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const mapX = (e.clientX - rect.left) / mapScale - mapOffset.x / mapScale;
    const mapY = (e.clientY - rect.top) / mapScale - mapOffset.y / mapScale;
    
    // Проверяем, кликнули ли по точке спавна
    const clickedSpawn = getClickedSpawnPoint(mapX, mapY);
    
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      mapX,
      mapY,
      clickedSpawn // Добавляем кликнутую точку спавна в контекст
    });
  }, [isDM, mapScale, mapOffset, getClickedSpawnPoint]);

  // Закрытие контекстного меню
  const closeContextMenu = useCallback(() => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  }, []);

  // Действия контекстного меню
  const handleAddSpawn = useCallback(() => {
    const { mapX, mapY } = contextMenu;
    
    // Проверяем не слишком ли близко к другим точкам спавна
    const minDistance = 64;
    const tooClose = spawnPoints.some(spawn => {
      const distance = Math.sqrt((spawn.x - mapX) ** 2 + (spawn.y - mapY) ** 2);
      return distance < minDistance;
    });
    
    if (!tooClose && spawnPoints.length < 6) {
      useFogOfWarStore.getState().addSpawnPoint(mapX, mapY);
    }
  }, [contextMenu, spawnPoints]);

  const handleAddToken = useCallback(() => {
    console.log('🎭 Добавление токена в позицию:', contextMenu.mapX, contextMenu.mapY);
    // TODO: Открыть диалог выбора токена
  }, [contextMenu]);

  const handleAddAsset = useCallback(() => {
    console.log('🏛️ Добавление ассета в позицию:', contextMenu.mapX, contextMenu.mapY);
    // TODO: Открыть библиотеку ассетов
  }, [contextMenu]);

  const handleAddEffect = useCallback(() => {
    console.log('⚡ Добавление области эффекта в позицию:', contextMenu.mapX, contextMenu.mapY);
    // TODO: Открыть выбор эффектов
  }, [contextMenu]);

  const handleAddTrap = useCallback(() => {
    console.log('🎯 Добавление ловушки в позицию:', contextMenu.mapX, contextMenu.mapY);
    // TODO: Открыть настройки ловушки
  }, [contextMenu]);

  // Удаление точки спавна
  const handleDeleteSpawn = useCallback(() => {
    if (contextMenu.clickedSpawn?.id) {
      useFogOfWarStore.getState().removeSpawnPoint(contextMenu.clickedSpawn.id);
    }
  }, [contextMenu]);
  
  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-auto"
        style={{
          width: `${mapWidth}px`,
          height: `${mapHeight}px`,
          zIndex: 30, // Выше токенов но ниже UI
          cursor: dragState.isDragging ? 'grabbing' : (isDM ? 'pointer' : 'default'),
          imageRendering: 'pixelated' // Четкие пиксели
        }}
        onContextMenu={handleContextMenu}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp} // Завершаем перетаскивание если мышь покинула канвас
      />
      
      {/* Контекстное меню для DM */}
      {isDM && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          visible={contextMenu.visible}
          clickedSpawn={contextMenu.clickedSpawn}
          onClose={closeContextMenu}
          onAddSpawn={handleAddSpawn}
          onAddToken={handleAddToken}
          onAddAsset={handleAddAsset}
          onAddEffect={handleAddEffect}
          onAddTrap={handleAddTrap}
          onDeleteSpawn={handleDeleteSpawn}
        />
      )}
      
      {/* Версия для игроков - только области вокруг их токенов */}
      {!isDM && (
        <canvas
          ref={playerViewCanvasRef}
          className="absolute inset-0 pointer-events-none"
          style={{
            width: `${mapWidth}px`,
            height: `${mapHeight}px`,
            zIndex: 30,
            imageRendering: 'pixelated'
          }}
        />
      )}
    </>
  );
};