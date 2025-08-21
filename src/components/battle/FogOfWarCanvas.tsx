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
  
  // Инициализация тумана при первой загрузке
  useEffect(() => {
    if (!isInitialized) {
      initializeFog(mapWidth, mapHeight, 32);
    }
  }, [isInitialized, mapWidth, mapHeight, initializeFog]);
  
  // Отрисовка тумана
  const drawFog = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !fogGrid.length) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Настраиваем канвас
    canvas.width = mapWidth;
    canvas.height = mapHeight;
    
    // Очищаем канвас
    ctx.clearRect(0, 0, mapWidth, mapHeight);
    
    // Рисуем туман
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        if (fogGrid[y][x] === 0) { // Закрыто туманом
          const worldX = x * cellSize;
          const worldY = y * cellSize;
          
          ctx.fillRect(worldX, worldY, cellSize, cellSize);
        }
      }
    }
    
    // Рисуем точки спавна для ДМ
    if (isDM) {
      spawnPoints.forEach((spawn, index) => {
        const x = spawn.x;
        const y = spawn.y;
        
        // Фон точки спавна
        ctx.fillStyle = spawn.playerId ? 'rgba(34, 197, 94, 0.7)' : 'rgba(59, 130, 246, 0.7)';
        ctx.fillRect(x - 16, y - 16, 32, 32);
        
        // Обводка
        ctx.strokeStyle = spawn.playerId ? '#22c55e' : '#3b82f6';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 16, y - 16, 32, 32);
        
        // Номер точки
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText((index + 1).toString(), x, y + 5);
      });
    }
  }, [fogGrid, gridWidth, gridHeight, cellSize, mapWidth, mapHeight, spawnPoints, isDM]);
  
  // Перерисовка при изменениях
  useEffect(() => {
    drawFog();
  }, [drawFog, lastUpdated]);
  
  // Состояние для контекстного меню
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    mapX: 0,
    mapY: 0
  });

  // Обработчик правого клика для показа контекстного меню
  const handleContextMenu = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDM) return;
    
    e.preventDefault();
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const mapX = (e.clientX - rect.left) / mapScale - mapOffset.x / mapScale;
    const mapY = (e.clientY - rect.top) / mapScale - mapOffset.y / mapScale;
    
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      mapX,
      mapY
    });
  }, [isDM, mapScale, mapOffset]);

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
  
  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-auto"
        style={{
          width: mapWidth,
          height: mapHeight,
          zIndex: 20,
          cursor: isDM ? 'context-menu' : 'default'
        }}
        onContextMenu={handleContextMenu}
      />
      
      {/* Контекстное меню для DM */}
      {isDM && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          visible={contextMenu.visible}
          onClose={closeContextMenu}
          onAddSpawn={handleAddSpawn}
          onAddToken={handleAddToken}
          onAddAsset={handleAddAsset}
          onAddEffect={handleAddEffect}
          onAddTrap={handleAddTrap}
        />
      )}
      
      {/* Версия для игроков - только области вокруг их токенов */}
      {!isDM && (
        <canvas
          ref={playerViewCanvasRef}
          className="absolute inset-0 pointer-events-none"
          style={{
            width: mapWidth,
            height: mapHeight,
            zIndex: 20
          }}
        />
      )}
    </>
  );
};