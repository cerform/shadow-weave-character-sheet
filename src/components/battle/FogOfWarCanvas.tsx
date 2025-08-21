// Компонент для отрисовки тумана войны
import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useFogOfWarStore } from '@/stores/fogOfWarStore';
import { useUnifiedBattleStore } from '@/stores/unifiedBattleStore';

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
  
  // Обработка клика для добавления точек спавна (только в режиме добавления спавнов)
  const { mapEditMode } = useUnifiedBattleStore();
  const [spawnMode, setSpawnMode] = useState(false);
  
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDM || !spawnMode) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / mapScale - mapOffset.x / mapScale;
    const y = (e.clientY - rect.top) / mapScale - mapOffset.y / mapScale;
    
    // Проверяем не слишком ли близко к другим точкам спавна
    const minDistance = 64;
    const tooClose = spawnPoints.some(spawn => {
      const distance = Math.sqrt((spawn.x - x) ** 2 + (spawn.y - y) ** 2);
      return distance < minDistance;
    });
    
    if (!tooClose && spawnPoints.length < 6) {
      useFogOfWarStore.getState().addSpawnPoint(x, y);
      setSpawnMode(false); // Выключаем режим после добавления
    }
  }, [isDM, mapScale, mapOffset, spawnPoints, spawnMode]);
  
  return (
    <>
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 ${spawnMode ? 'pointer-events-auto' : 'pointer-events-none'}`}
        style={{
          width: mapWidth,
          height: mapHeight,
          zIndex: spawnMode ? 30 : 20,
          cursor: spawnMode ? 'crosshair' : 'default'
        }}
        onClick={handleCanvasClick}
      />
      
      {/* Кнопка для режима добавления точек спавна */}
      {isDM && (
        <button
          onClick={() => setSpawnMode(!spawnMode)}
          className={`absolute top-4 left-4 z-40 px-3 py-2 rounded-md border text-sm transition-colors ${
            spawnMode 
              ? 'border-emerald-400 text-emerald-400 bg-emerald-400/10' 
              : 'border-neutral-600 text-neutral-300 hover:border-neutral-500'
          }`}
          title={spawnMode ? 'Кликните по карте для добавления точки спавна' : 'Активировать режим добавления точек спавна'}
        >
          {spawnMode ? '✓ Добавление точек спавна' : '+ Точки спавна'}
        </button>
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