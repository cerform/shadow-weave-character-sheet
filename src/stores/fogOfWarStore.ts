// Система тумана войны для D&D
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type FogCell = 0 | 1; // 0 = туман, 1 = открыто
export type FogGrid = FogCell[][];

export interface SpawnPoint {
  id: string;
  x: number;
  y: number;
  name: string;
  isActive: boolean;
  playerId?: string;
}

export interface FogOfWarState {
  // Сетка тумана (0 = закрыто, 1 = открыто)
  fogGrid: FogGrid;
  gridWidth: number;
  gridHeight: number;
  cellSize: number; // размер клетки в пикселях
  
  // Точки спавна игроков
  spawnPoints: SpawnPoint[];
  maxSpawnPoints: number;
  
  // Настройки
  playerVisionRadius: number; // радиус видимости игроков
  revealOnMove: boolean; // открывать туман при движении
  
  // Состояние
  isInitialized: boolean;
  lastUpdated: number;
  
  // Действия
  initializeFog: (mapWidth: number, mapHeight: number, cellSize?: number) => void;
  revealArea: (centerX: number, centerY: number, radius: number) => void;
  hideArea: (centerX: number, centerY: number, radius: number) => void;
  clearAllFog: () => void;
  resetFog: () => void;
  
  // Точки спавна
  addSpawnPoint: (x: number, y: number, name?: string) => void;
  removeSpawnPoint: (id: string) => void;
  updateSpawnPoint: (id: string, updates: Partial<SpawnPoint>) => void;
  assignPlayerToSpawn: (spawnId: string, playerId: string) => void;
  
  // Утилиты
  isCellRevealed: (x: number, y: number) => boolean;
  getCellAtPosition: (worldX: number, worldY: number) => { gridX: number; gridY: number; revealed: boolean };
  updatePlayerVision: (playerId: string, worldX: number, worldY: number) => void;
}

export const useFogOfWarStore = create<FogOfWarState>()(
  persist(
    (set, get) => ({
      // Начальное состояние
      fogGrid: [],
      gridWidth: 0,
      gridHeight: 0,
      cellSize: 32,
      
      spawnPoints: [],
      maxSpawnPoints: 6,
      
      playerVisionRadius: 3, // клетки
      revealOnMove: true,
      
      isInitialized: false,
      lastUpdated: 0,
      
      // Инициализация тумана
      initializeFog: (mapWidth: number, mapHeight: number, cellSize = 32) => {
        const gridWidth = Math.ceil(mapWidth / cellSize);
        const gridHeight = Math.ceil(mapHeight / cellSize);
        
        // Создаем сетку полностью закрытую туманом
        const fogGrid: FogGrid = Array(gridHeight).fill(null).map(() => 
          Array(gridWidth).fill(0)
        );
        
        set({
          fogGrid,
          gridWidth,
          gridHeight,
          cellSize,
          isInitialized: true,
          lastUpdated: Date.now()
        });
      },
      
      // Открыть область
      revealArea: (centerX: number, centerY: number, radius: number) => {
        const { fogGrid, gridWidth, gridHeight, cellSize } = get();
        if (!fogGrid.length) return;
        
        const gridX = Math.floor(centerX / cellSize);
        const gridY = Math.floor(centerY / cellSize);
        
        const newGrid = fogGrid.map(row => [...row]);
        
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance <= radius) {
              const x = gridX + dx;
              const y = gridY + dy;
              
              if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
                newGrid[y][x] = 1;
              }
            }
          }
        }
        
        set({
          fogGrid: newGrid,
          lastUpdated: Date.now()
        });
      },
      
      // Скрыть область
      hideArea: (centerX: number, centerY: number, radius: number) => {
        const { fogGrid, gridWidth, gridHeight, cellSize } = get();
        if (!fogGrid.length) return;
        
        const gridX = Math.floor(centerX / cellSize);
        const gridY = Math.floor(centerY / cellSize);
        
        const newGrid = fogGrid.map(row => [...row]);
        
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance <= radius) {
              const x = gridX + dx;
              const y = gridY + dy;
              
              if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
                newGrid[y][x] = 0;
              }
            }
          }
        }
        
        set({
          fogGrid: newGrid,
          lastUpdated: Date.now()
        });
      },
      
      // Очистить весь туман
      clearAllFog: () => {
        const { gridWidth, gridHeight } = get();
        const fogGrid: FogGrid = Array(gridHeight).fill(null).map(() => 
          Array(gridWidth).fill(1)
        );
        
        set({
          fogGrid,
          lastUpdated: Date.now()
        });
      },
      
      // Сбросить туман (закрыть всё)
      resetFog: () => {
        const { gridWidth, gridHeight } = get();
        const fogGrid: FogGrid = Array(gridHeight).fill(null).map(() => 
          Array(gridWidth).fill(0)
        );
        
        set({
          fogGrid,
          lastUpdated: Date.now()
        });
      },
      
      // Добавить точку спавна
      addSpawnPoint: (x: number, y: number, name?: string) => {
        const { spawnPoints, maxSpawnPoints } = get();
        
        if (spawnPoints.length >= maxSpawnPoints) return;
        
        const newSpawn: SpawnPoint = {
          id: crypto.randomUUID(),
          x,
          y,
          name: name || `Точка ${spawnPoints.length + 1}`,
          isActive: true
        };
        
        set({
          spawnPoints: [...spawnPoints, newSpawn],
          lastUpdated: Date.now()
        });
        
        // Открываем область вокруг точки спавна
        get().revealArea(x, y, get().playerVisionRadius);
      },
      
      // Удалить точку спавна
      removeSpawnPoint: (id: string) => {
        set(state => ({
          spawnPoints: state.spawnPoints.filter(sp => sp.id !== id),
          lastUpdated: Date.now()
        }));
      },
      
      // Обновить точку спавна
      updateSpawnPoint: (id: string, updates: Partial<SpawnPoint>) => {
        set(state => ({
          spawnPoints: state.spawnPoints.map(sp => 
            sp.id === id ? { ...sp, ...updates } : sp
          ),
          lastUpdated: Date.now()
        }));
      },
      
      // Назначить игрока на точку спавна
      assignPlayerToSpawn: (spawnId: string, playerId: string) => {
        set(state => ({
          spawnPoints: state.spawnPoints.map(sp => 
            sp.id === spawnId ? { ...sp, playerId } : sp
          ),
          lastUpdated: Date.now()
        }));
      },
      
      // Проверить открыта ли клетка
      isCellRevealed: (x: number, y: number) => {
        const { fogGrid, gridWidth, gridHeight } = get();
        if (x < 0 || x >= gridWidth || y < 0 || y >= gridHeight) return false;
        return fogGrid[y]?.[x] === 1;
      },
      
      // Получить клетку по мировым координатам
      getCellAtPosition: (worldX: number, worldY: number) => {
        const { cellSize } = get();
        const gridX = Math.floor(worldX / cellSize);
        const gridY = Math.floor(worldY / cellSize);
        const revealed = get().isCellRevealed(gridX, gridY);
        
        return { gridX, gridY, revealed };
      },
      
      // Обновить видимость для игрока  
      updatePlayerVision: (playerId: string, gridX: number, gridY: number) => {
        const { revealOnMove, playerVisionRadius } = get();
        
        console.log('🌫️ updatePlayerVision вызвана:', {
          playerId,
          gridX,
          gridY,
          revealOnMove,
          playerVisionRadius
        });
        
        if (revealOnMove) {
          console.log('🌫️ Раскрываем туман в радиусе', playerVisionRadius, 'вокруг позиции', gridX, gridY);
          get().revealArea(gridX, gridY, playerVisionRadius);
        } else {
          console.log('🌫️ revealOnMove выключено, туман не обновляется');
        }
      }
    }),
    {
      name: 'fog-of-war-storage',
      partialize: (state) => ({
        fogGrid: state.fogGrid,
        gridWidth: state.gridWidth,
        gridHeight: state.gridHeight,
        cellSize: state.cellSize,
        spawnPoints: state.spawnPoints,
        playerVisionRadius: state.playerVisionRadius,
        revealOnMove: state.revealOnMove,
        isInitialized: state.isInitialized
      })
    }
  )
);