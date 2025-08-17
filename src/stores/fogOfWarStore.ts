import { create } from 'zustand';

export interface VisibleArea {
  id: string;
  x: number;
  y: number;
  radius: number;
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
  brushSize: number;
}

export interface FogTransform {
  offsetX: number;
  offsetY: number;
  scale: number;
}

interface FogOfWarStore {
  // State
  visibleAreas: VisibleArea[];
  fogSettings: FogSettings;
  fogTransform: FogTransform;
  isDrawingMode: boolean;
  selectedArea: string | null;
  isDM: boolean;
  isDrawing: boolean;
  isPanning: boolean;
  activeMode: 'map' | 'fog';

  // Actions
  setIsDM: (isDM: boolean) => void;
  enableFog: (enabled: boolean) => void;
  addVisibleArea: (area: Omit<VisibleArea, 'id'>) => void;
  updateVisibleArea: (id: string, updates: Partial<VisibleArea>) => void;
  removeVisibleArea: (id: string) => void;
  revealAll: () => void;
  hideAll: () => void;
  clearAllVisible: () => void;
  setFogSettings: (settings: Partial<FogSettings>) => void;
  setFogTransform: (transform: Partial<FogTransform>) => void;
  resetFogTransform: () => void;
  setDrawingMode: (drawing: boolean) => void;
  setIsDrawing: (drawing: boolean) => void;
  setIsPanning: (panning: boolean) => void;
  setActiveMode: (mode: 'map' | 'fog') => void;
  selectArea: (id: string | null) => void;
  drawVisibleArea: (x: number, y: number) => void;
  hideVisibleArea: (x: number, y: number) => void;
  
  // Transform utilities
  transformPoint: (x: number, y: number) => { x: number; y: number };
  inverseTransformPoint: (x: number, y: number) => { x: number; y: number };
  
  // Utility functions
  isPositionRevealed: (x: number, y: number) => boolean;
  getFogOpacityAtPosition: (x: number, y: number) => number;
}

export const useFogOfWarStore = create<FogOfWarStore>((set, get) => ({
  visibleAreas: [],
  fogSettings: {
    enabled: true,
    globalReveal: false,
    fogColor: '#505055',
    fogOpacity: 0.4,
    transitionSpeed: 0.5,
    blurAmount: 12,
    brushSize: 50
  },
  fogTransform: {
    offsetX: 0,
    offsetY: 0,
    scale: 1
  },
  isDrawingMode: false,
  selectedArea: null,
  isDM: false,
  isDrawing: false,
  isPanning: false,
  activeMode: 'map',

  setIsDM: (isDM) => set({ isDM }),

  enableFog: (enabled) =>
    set((state) => ({
      fogSettings: { ...state.fogSettings, enabled }
    })),

  addVisibleArea: (area) => {
    const id = `visible_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newArea: VisibleArea = { ...area, id };
    
    set((state) => ({
      visibleAreas: [...state.visibleAreas, newArea]
    }));
  },

  updateVisibleArea: (id, updates) =>
    set((state) => ({
      visibleAreas: state.visibleAreas.map((area) =>
        area.id === id ? { ...area, ...updates } : area
      )
    })),

  removeVisibleArea: (id) =>
    set((state) => ({
      visibleAreas: state.visibleAreas.filter((area) => area.id !== id),
      selectedArea: state.selectedArea === id ? null : state.selectedArea
    })),

  revealAll: () =>
    set((state) => ({
      fogSettings: { ...state.fogSettings, globalReveal: true }
    })),

  hideAll: () =>
    set((state) => ({
      visibleAreas: [],
      fogSettings: { ...state.fogSettings, globalReveal: false }
    })),

  clearAllVisible: () =>
    set({
      visibleAreas: [],
      selectedArea: null,
      isDrawingMode: false
    }),

  setFogSettings: (settings) =>
    set((state) => ({
      fogSettings: { ...state.fogSettings, ...settings }
    })),

  setDrawingMode: (drawing) =>
    set({ isDrawingMode: drawing }),

  setIsDrawing: (drawing) =>
    set({ isDrawing: drawing }),

  setIsPanning: (panning) =>
    set({ isPanning: panning }),

  setActiveMode: (mode) =>
    set({ activeMode: mode }),

  setFogTransform: (transform) =>
    set((state) => ({
      fogTransform: { ...state.fogTransform, ...transform }
    })),

  resetFogTransform: () =>
    set({
      fogTransform: { offsetX: 0, offsetY: 0, scale: 1 }
    }),

  selectArea: (id) =>
    set({ selectedArea: id }),

  drawVisibleArea: (x, y) => {
    const { fogSettings, inverseTransformPoint } = get();
    const transformedPoint = inverseTransformPoint(x, y);
    
    const newArea: Omit<VisibleArea, 'id'> = {
      x: transformedPoint.x,
      y: transformedPoint.y,
      radius: fogSettings.brushSize,
      type: 'circle'
    };
    
    get().addVisibleArea(newArea);
  },

  hideVisibleArea: (x, y) => {
    const { fogSettings, visibleAreas, inverseTransformPoint } = get();
    const transformedPoint = inverseTransformPoint(x, y);
    
    // Находим области, которые нужно удалить (те, которые пересекаются с кистью)
    const areasToRemove = visibleAreas.filter((area) => {
      const distance = Math.sqrt((transformedPoint.x - area.x) ** 2 + (transformedPoint.y - area.y) ** 2);
      return distance <= fogSettings.brushSize;
    });
    
    // Удаляем найденные области
    areasToRemove.forEach((area) => {
      get().removeVisibleArea(area.id);
    });
  },

  transformPoint: (x, y) => {
    const { fogTransform } = get();
    return {
      x: (x * fogTransform.scale) + fogTransform.offsetX,
      y: (y * fogTransform.scale) + fogTransform.offsetY
    };
  },

  inverseTransformPoint: (x, y) => {
    const { fogTransform } = get();
    return {
      x: (x - fogTransform.offsetX) / fogTransform.scale,
      y: (y - fogTransform.offsetY) / fogTransform.scale
    };
  },

  isPositionRevealed: (x, y) => {
    const { visibleAreas, fogSettings } = get();
    
    if (!fogSettings.enabled || fogSettings.globalReveal) {
      return true;
    }

    return visibleAreas.some((area) => {
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