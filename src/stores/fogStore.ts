// src/stores/fogStore.ts
import { create } from 'zustand';

interface FogState {
  maps: { [key: string]: Uint8Array };
  sizes: { [key: string]: { w: number; h: number } }; // Размеры для каждой карты
  size: { w: number; h: number }; // Deprecated, для обратной совместимости
  setMap: (id: string, data: Uint8Array, width: number, height: number) => void;
  reveal: (id: string, x: number, y: number, radius: number) => void;
  clearMap: (id: string) => void;
  getSize: (id: string) => { w: number; h: number };
}

export const useFogStore = create<FogState>((set, get) => ({
  maps: {},
  sizes: {},
  size: { w: 0, h: 0 },
  
  setMap: (id: string, data: Uint8Array, width: number, height: number) => {
    const { maps, sizes } = get();
    set({
      maps: {
        ...maps,
        [id]: new Uint8Array(data)
      },
      sizes: {
        ...sizes,
        [id]: { w: width, h: height }
      },
      size: { w: width, h: height } // Для обратной совместимости
    });
  },
  
  reveal: (id: string, x: number, y: number, radius: number) => {
    const { maps, sizes } = get();
    const map = maps[id];
    const size = sizes[id];
    if (!map || !size) return;
    
    const newMap = new Uint8Array(map);
    const width = size.w;
    
    // Simple circle reveal
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx * dx + dy * dy <= radius * radius) {
          const px = x + dx;
          const py = y + dy;
          if (px >= 0 && px < width && py >= 0 && py < size.h) {
            newMap[py * width + px] = 1;
          }
        }
      }
    }
    
    set({
      maps: {
        ...maps,
        [id]: newMap
      }
    });
  },
  
  clearMap: (id: string) => {
    const { maps, sizes } = get();
    const updatedMaps = { ...maps };
    const updatedSizes = { ...sizes };
    delete updatedMaps[id];
    delete updatedSizes[id];
    set({ maps: updatedMaps, sizes: updatedSizes });
  },
  
  getSize: (id: string) => {
    const { sizes } = get();
    return sizes[id] || { w: 0, h: 0 };
  }
}));