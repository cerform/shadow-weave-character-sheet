// src/stores/unifiedFogStore.ts
import { create } from 'zustand';
import { FogGrid } from '@/game/fog/FogGrid';
import { FogVision } from '@/game/fog/FogVision';
import { VisionSource, LOSBlocker, FogStateSnapshot } from '@/game/fog/FogTypes';
import { supabase } from '@/integrations/supabase/client';

interface UnifiedFogState {
  // Core fog system
  fogGrid: FogGrid | null;
  fogVision: FogVision | null;
  
  // Configuration
  mapWidth: number;
  mapHeight: number;
  cellSize: number;
  enabled: boolean;
  
  // Vision sources (players, lights, etc.)
  visionSources: VisionSource[];
  losBlockers: LOSBlocker[];
  
  // UI state
  isDM: boolean;
  activeMode: 'map' | 'fog';
  brushSize: number;
  isDrawing: boolean;
  
  // Session management
  sessionId: string | null;
  mapId: string | null;
  
  // Actions
  initializeFog: (mapWidth: number, mapHeight: number, cellSize?: number) => void;
  setEnabled: (enabled: boolean) => void;
  setIsDM: (isDM: boolean) => void;
  setActiveMode: (mode: 'map' | 'fog') => void;
  setBrushSize: (size: number) => void;
  setIsDrawing: (drawing: boolean) => void;
  
  // Fog manipulation
  revealArea: (x: number, y: number, radius?: number) => void;
  hideArea: (x: number, y: number, radius?: number) => void;
  revealAll: () => void;
  hideAll: () => void;
  
  // Vision sources
  addVisionSource: (source: VisionSource) => void;
  removeVisionSource: (index: number) => void;
  updateVisionSource: (index: number, source: Partial<VisionSource>) => void;
  setVisionSources: (sources: VisionSource[]) => void;
  
  // LOS blockers
  setLOSBlockers: (blockers: LOSBlocker[]) => void;
  
  // Update vision calculation
  updateVision: () => void;
  
  // Persistence
  saveToDatabase: (sessionId: string, mapId: string) => Promise<void>;
  loadFromDatabase: (sessionId: string, mapId: string) => Promise<void>;
  
  // Get fog state for rendering
  getFogOpacity: (x: number, y: number) => number;
  getFogSnapshot: () => FogStateSnapshot | null;
  loadFogSnapshot: (snapshot: FogStateSnapshot) => void;
}

export const useUnifiedFogStore = create<UnifiedFogState>((set, get) => ({
  // Initial state
  fogGrid: null,
  fogVision: null,
  mapWidth: 1920,
  mapHeight: 1280,
  cellSize: 40,
  enabled: true,
  visionSources: [],
  losBlockers: [],
  isDM: false,
  activeMode: 'map',
  brushSize: 150,
  isDrawing: false,
  sessionId: null,
  mapId: null,

  // Initialize fog system
  initializeFog: (mapWidth: number, mapHeight: number, cellSize = 40) => {
    const cols = Math.ceil(mapWidth / cellSize);
    const rows = Math.ceil(mapHeight / cellSize);
    
    const fogGrid = new FogGrid({ cols, rows, cellSize });
    const fogVision = new FogVision(fogGrid);
    
    set({
      fogGrid,
      fogVision,
      mapWidth,
      mapHeight,
      cellSize
    });
    
    console.log(`🌫️ Fog system initialized: ${cols}x${rows} grid, ${cellSize}px cells`);
  },

  setEnabled: (enabled) => set({ enabled }),
  setIsDM: (isDM) => set({ isDM }),
  setActiveMode: (mode) => set({ activeMode: mode }),
  setBrushSize: (size) => set({ brushSize: Math.max(50, Math.min(500, size)) }),
  setIsDrawing: (drawing) => set({ isDrawing: drawing }),

  // Fog manipulation
  revealArea: (x, y, radius) => {
    const { fogGrid, brushSize } = get();
    if (!fogGrid) return;
    
    const actualRadius = radius || brushSize;
    fogGrid.revealCircle(x, y, actualRadius);
    
    // Trigger re-render by updating state
    set({ fogGrid: fogGrid });
  },

  hideArea: (x, y, radius) => {
    const { fogGrid, brushSize } = get();
    if (!fogGrid) return;
    
    const actualRadius = radius || brushSize;
    fogGrid.hideCircle(x, y, actualRadius);
    
    // Trigger re-render by updating state
    set({ fogGrid: fogGrid });
  },

  revealAll: () => {
    const { fogGrid } = get();
    if (!fogGrid) return;
    
    fogGrid.revealAll();
    set({ fogGrid: fogGrid });
  },

  hideAll: () => {
    const { fogGrid } = get();
    if (!fogGrid) return;
    
    fogGrid.hideAll();
    set({ fogGrid: fogGrid });
  },

  // Vision sources management
  addVisionSource: (source) => {
    const { visionSources } = get();
    set({ visionSources: [...visionSources, source] });
    get().updateVision();
  },

  removeVisionSource: (index) => {
    const { visionSources } = get();
    const newSources = visionSources.filter((_, i) => i !== index);
    set({ visionSources: newSources });
    get().updateVision();
  },

  updateVisionSource: (index, updates) => {
    const { visionSources } = get();
    const newSources = visionSources.map((source, i) =>
      i === index ? { ...source, ...updates } : source
    );
    set({ visionSources: newSources });
    get().updateVision();
  },

  setVisionSources: (sources) => {
    set({ visionSources: sources });
    get().updateVision();
  },

  setLOSBlockers: (blockers) => {
    const { fogVision } = get();
    if (fogVision) {
      fogVision.setBlockers(blockers);
    }
    set({ losBlockers: blockers });
    get().updateVision();
  },

  // Update vision calculation
  updateVision: () => {
    const { fogVision, visionSources } = get();
    if (!fogVision) return;
    
    fogVision.updateVision(visionSources);
    
    // Trigger re-render by updating state
    set({ fogVision: fogVision });
  },

  // Get fog opacity for rendering
  getFogOpacity: (x, y) => {
    const { fogGrid } = get();
    if (!fogGrid) return 0;
    
    const { x: gridX, y: gridY } = fogGrid.worldToGrid(x, y);
    return fogGrid.getOpacity(gridX, gridY);
  },

  // Snapshot management
  getFogSnapshot: () => {
    const { fogGrid } = get();
    return fogGrid?.snapshot() || null;
  },

  loadFogSnapshot: (snapshot) => {
    const { fogGrid } = get();
    if (!fogGrid) return;
    
    fogGrid.load(snapshot);
    set({ fogGrid: fogGrid });
  },

  // Database persistence
  saveToDatabase: async (sessionId: string, mapId: string) => {
    const { fogGrid } = get();
    if (!fogGrid) return;
    
    try {
      // Clear existing fog data for this session/map
      await supabase
        .from('fog_of_war')
        .delete()
        .eq('session_id', sessionId)
        .eq('map_id', mapId);
      
      // Convert grid to database format
      const fogCells = [];
      for (let x = 0; x < fogGrid.cols; x++) {
        for (let y = 0; y < fogGrid.rows; y++) {
          const state = fogGrid.get(x, y);
          if (state > 0) { // Only save non-hidden cells
            fogCells.push({
              session_id: sessionId,
              map_id: mapId,
              grid_x: x,
              grid_y: y,
              is_revealed: state === 2 // true for visible, false for explored
            });
          }
        }
      }
      
      // Insert new fog data
      if (fogCells.length > 0) {
        const { error } = await supabase
          .from('fog_of_war')
          .insert(fogCells);
        
        if (error) throw error;
      }
      
      console.log('✅ Fog data saved to database:', fogCells.length, 'cells');
    } catch (error) {
      console.error('❌ Error saving fog data:', error);
    }
  },

  loadFromDatabase: async (sessionId: string, mapId: string) => {
    const { fogGrid } = get();
    if (!fogGrid) return;
    
    try {
      const { data, error } = await supabase
        .from('fog_of_war')
        .select('*')
        .eq('session_id', sessionId)
        .eq('map_id', mapId);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Clear current grid
        fogGrid.hideAll();
        
        // Load fog data
        data.forEach(cell => {
          const state = cell.is_revealed ? 2 : 1; // 2 = visible, 1 = explored
          fogGrid.set(cell.grid_x, cell.grid_y, state);
        });
        
        // Trigger re-render
        set({ fogGrid: fogGrid });
        console.log('✅ Fog data loaded from database:', data.length, 'cells');
      } else {
        console.log('📭 No fog data found in database');
      }
    } catch (error) {
      console.error('❌ Error loading fog data:', error);
    }
  }
}));