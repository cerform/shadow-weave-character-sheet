// Enhanced fog store with performance optimizations
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface FogCell {
  revealed: boolean;
  timestamp: number;
  animationProgress: number;
}

interface EnhancedFogState {
  maps: Map<string, Map<string, FogCell>>;
  dimensions: Map<string, { width: number; height: number }>;
  
  // Actions
  initializeMap: (mapId: string, width: number, height: number, initialVisibility?: boolean) => void;
  revealArea: (mapId: string, x: number, y: number, radius: number) => void;
  hideArea: (mapId: string, x: number, y: number, radius: number) => void;
  toggleCell: (mapId: string, x: number, y: number) => void;
  clearMap: (mapId: string) => void;
  
  // Getters
  getCellState: (mapId: string, x: number, y: number) => FogCell | null;
  getVisibleCells: (mapId: string) => Array<{ x: number; y: number; cell: FogCell }>;
  getHiddenCells: (mapId: string) => Array<{ x: number; y: number; cell: FogCell }>;
}

const createCellKey = (x: number, y: number) => `${x},${y}`;
const parseCellKey = (key: string) => {
  const [x, y] = key.split(',').map(Number);
  return { x, y };
};

export const useEnhancedFogStore = create<EnhancedFogState>()(
  subscribeWithSelector((set, get) => ({
    maps: new Map(),
    dimensions: new Map(),
    
    initializeMap: (mapId: string, width: number, height: number, initialVisibility = false) => {
      set((state) => {
        const newMaps = new Map(state.maps);
        const newDimensions = new Map(state.dimensions);
        
        const cellMap = new Map<string, FogCell>();
        
        // Initialize all cells
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            cellMap.set(createCellKey(x, y), {
              revealed: initialVisibility,
              timestamp: Date.now(),
              animationProgress: initialVisibility ? 1 : 0
            });
          }
        }
        
        newMaps.set(mapId, cellMap);
        newDimensions.set(mapId, { width, height });
        
        return {
          maps: newMaps,
          dimensions: newDimensions
        };
      });
    },
    
    revealArea: (mapId: string, x: number, y: number, radius: number) => {
      const { maps, dimensions } = get();
      const cellMap = maps.get(mapId);
      const dims = dimensions.get(mapId);
      
      if (!cellMap || !dims) return;
      
      set((state) => {
        const newMaps = new Map(state.maps);
        const newCellMap = new Map(cellMap);
        
        const radiusSquared = radius * radius;
        const timestamp = Date.now();
        
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            if (dx * dx + dy * dy <= radiusSquared) {
              const cellX = x + dx;
              const cellY = y + dy;
              
              if (cellX >= 0 && cellX < dims.width && cellY >= 0 && cellY < dims.height) {
                const key = createCellKey(cellX, cellY);
                const currentCell = newCellMap.get(key);
                
                if (currentCell && !currentCell.revealed) {
                  newCellMap.set(key, {
                    revealed: true,
                    timestamp,
                    animationProgress: 0
                  });
                }
              }
            }
          }
        }
        
        newMaps.set(mapId, newCellMap);
        return { maps: newMaps };
      });
    },
    
    hideArea: (mapId: string, x: number, y: number, radius: number) => {
      const { maps, dimensions } = get();
      const cellMap = maps.get(mapId);
      const dims = dimensions.get(mapId);
      
      if (!cellMap || !dims) return;
      
      set((state) => {
        const newMaps = new Map(state.maps);
        const newCellMap = new Map(cellMap);
        
        const radiusSquared = radius * radius;
        const timestamp = Date.now();
        
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            if (dx * dx + dy * dy <= radiusSquared) {
              const cellX = x + dx;
              const cellY = y + dy;
              
              if (cellX >= 0 && cellX < dims.width && cellY >= 0 && cellY < dims.height) {
                const key = createCellKey(cellX, cellY);
                const currentCell = newCellMap.get(key);
                
                if (currentCell && currentCell.revealed) {
                  newCellMap.set(key, {
                    revealed: false,
                    timestamp,
                    animationProgress: 1
                  });
                }
              }
            }
          }
        }
        
        newMaps.set(mapId, newCellMap);
        return { maps: newMaps };
      });
    },
    
    toggleCell: (mapId: string, x: number, y: number) => {
      const { maps } = get();
      const cellMap = maps.get(mapId);
      
      if (!cellMap) return;
      
      const key = createCellKey(x, y);
      const cell = cellMap.get(key);
      
      if (cell) {
        if (cell.revealed) {
          get().hideArea(mapId, x, y, 0);
        } else {
          get().revealArea(mapId, x, y, 0);
        }
      }
    },
    
    clearMap: (mapId: string) => {
      const { dimensions } = get();
      const dims = dimensions.get(mapId);
      
      if (dims) {
        get().initializeMap(mapId, dims.width, dims.height, false);
      }
    },
    
    getCellState: (mapId: string, x: number, y: number) => {
      const { maps } = get();
      const cellMap = maps.get(mapId);
      
      if (!cellMap) return null;
      
      return cellMap.get(createCellKey(x, y)) || null;
    },
    
    getVisibleCells: (mapId: string) => {
      const { maps } = get();
      const cellMap = maps.get(mapId);
      
      if (!cellMap) return [];
      
      const result: Array<{ x: number; y: number; cell: FogCell }> = [];
      
      cellMap.forEach((cell, key) => {
        if (cell.revealed) {
          const { x, y } = parseCellKey(key);
          result.push({ x, y, cell });
        }
      });
      
      return result;
    },
    
    getHiddenCells: (mapId: string) => {
      const { maps } = get();
      const cellMap = maps.get(mapId);
      
      if (!cellMap) return [];
      
      const result: Array<{ x: number; y: number; cell: FogCell }> = [];
      
      cellMap.forEach((cell, key) => {
        if (!cell.revealed) {
          const { x, y } = parseCellKey(key);
          result.push({ x, y, cell });
        }
      });
      
      return result;
    }
  }))
);