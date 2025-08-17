import { create } from 'zustand';

export interface FogArea {
  id: string;
  x: number;
  y: number;
  radius: number;
  revealed: boolean;
  type: 'circle' | 'rectangle' | 'polygon';
  width?: number;
  height?: number;
  points?: { x: number; y: number }[];
}

export interface FogSettings {
  enabled: boolean;
  globalReveal: boolean;
  fogColor: string;
  fogOpacity: number;
  transitionSpeed: number;
  blurAmount: number;
}

interface FogOfWarStore {
  // State
  fogAreas: FogArea[];
  fogSettings: FogSettings;
  isEditingFog: boolean;
  selectedFogArea: string | null;
  isDM: boolean;

  // Actions
  setIsDM: (isDM: boolean) => void;
  enableFog: (enabled: boolean) => void;
  addFogArea: (area: Omit<FogArea, 'id'>) => void;
  updateFogArea: (id: string, updates: Partial<FogArea>) => void;
  removeFogArea: (id: string) => void;
  revealArea: (id: string) => void;
  hideArea: (id: string) => void;
  revealAll: () => void;
  hideAll: () => void;
  clearAllFog: () => void;
  setFogSettings: (settings: Partial<FogSettings>) => void;
  setEditingMode: (editing: boolean) => void;
  selectFogArea: (id: string | null) => void;
  
  // Utility functions
  isPositionRevealed: (x: number, y: number) => boolean;
  getFogOpacityAtPosition: (x: number, y: number) => number;
}

export const useFogOfWarStore = create<FogOfWarStore>((set, get) => ({
  fogAreas: [],
  fogSettings: {
    enabled: false,
    globalReveal: false,
    fogColor: '#000000',
    fogOpacity: 0.8,
    transitionSpeed: 0.3,
    blurAmount: 10
  },
  isEditingFog: false,
  selectedFogArea: null,
  isDM: false,

  setIsDM: (isDM) => set({ isDM }),

  enableFog: (enabled) =>
    set((state) => ({
      fogSettings: { ...state.fogSettings, enabled }
    })),

  addFogArea: (area) => {
    const id = `fog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newArea: FogArea = { ...area, id };
    
    set((state) => ({
      fogAreas: [...state.fogAreas, newArea]
    }));
  },

  updateFogArea: (id, updates) =>
    set((state) => ({
      fogAreas: state.fogAreas.map((area) =>
        area.id === id ? { ...area, ...updates } : area
      )
    })),

  removeFogArea: (id) =>
    set((state) => ({
      fogAreas: state.fogAreas.filter((area) => area.id !== id),
      selectedFogArea: state.selectedFogArea === id ? null : state.selectedFogArea
    })),

  revealArea: (id) =>
    set((state) => ({
      fogAreas: state.fogAreas.map((area) =>
        area.id === id ? { ...area, revealed: true } : area
      )
    })),

  hideArea: (id) =>
    set((state) => ({
      fogAreas: state.fogAreas.map((area) =>
        area.id === id ? { ...area, revealed: false } : area
      )
    })),

  revealAll: () =>
    set((state) => ({
      fogAreas: state.fogAreas.map((area) => ({ ...area, revealed: true })),
      fogSettings: { ...state.fogSettings, globalReveal: true }
    })),

  hideAll: () =>
    set((state) => ({
      fogAreas: state.fogAreas.map((area) => ({ ...area, revealed: false })),
      fogSettings: { ...state.fogSettings, globalReveal: false }
    })),

  clearAllFog: () =>
    set({
      fogAreas: [],
      selectedFogArea: null,
      isEditingFog: false
    }),

  setFogSettings: (settings) =>
    set((state) => ({
      fogSettings: { ...state.fogSettings, ...settings }
    })),

  setEditingMode: (editing) =>
    set({ isEditingFog: editing }),

  selectFogArea: (id) =>
    set({ selectedFogArea: id }),

  isPositionRevealed: (x, y) => {
    const { fogAreas, fogSettings } = get();
    
    if (!fogSettings.enabled || fogSettings.globalReveal) {
      return true;
    }

    return fogAreas.some((area) => {
      if (!area.revealed) return false;

      switch (area.type) {
        case 'circle':
          const distance = Math.sqrt((x - area.x) ** 2 + (y - area.y) ** 2);
          return distance <= area.radius;
        
        case 'rectangle':
          return (
            x >= area.x &&
            x <= area.x + (area.width || 0) &&
            y >= area.y &&
            y <= area.y + (area.height || 0)
          );
        
        case 'polygon':
          if (!area.points || area.points.length < 3) return false;
          return isPointInPolygon({ x, y }, area.points);
        
        default:
          return false;
      }
    });
  },

  getFogOpacityAtPosition: (x, y) => {
    const { fogSettings, isPositionRevealed } = get();
    
    if (!fogSettings.enabled) return 0;
    if (isPositionRevealed(x, y)) return 0;
    
    return fogSettings.fogOpacity;
  }
}));

// Utility function for point-in-polygon test
function isPointInPolygon(point: { x: number; y: number }, polygon: { x: number; y: number }[]) {
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    if (
      polygon[i].y > point.y !== polygon[j].y > point.y &&
      point.x < ((polygon[j].x - polygon[i].x) * (point.y - polygon[i].y)) / (polygon[j].y - polygon[i].y) + polygon[i].x
    ) {
      inside = !inside;
    }
  }
  
  return inside;
}