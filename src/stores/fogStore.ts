// src/stores/fogStore.ts
import { create } from 'zustand';

interface FogState {
  maps: { [key: string]: Uint8Array };
  size: { w: number; h: number };
  setMap: (id: string, data: Uint8Array, width: number, height: number) => void;
  reveal: (id: string, x: number, y: number, radius: number) => void;
}

export const useFogStore = create<FogState>((set, get) => ({
  maps: {},
  size: { w: 0, h: 0 },
  
  setMap: (id: string, data: Uint8Array, width: number, height: number) => {
    const { maps } = get();
    set({
      maps: {
        ...maps,
        [id]: new Uint8Array(data)
      },
      size: { w: width, h: height }
    });
  },
  
  reveal: (id: string, x: number, y: number, radius: number) => {
    const { maps, size } = get();
    const map = maps[id];
    if (!map) return;
    
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
  }
}));