// src/stores/fogGridStore.ts
import { create } from "zustand";
import { FogGrid } from "@/game/fog/FogGrid";
import { FogGridOptions } from "@/game/fog/FogTypes";
import type { VisionSource, LOSBlocker, FogStateSnapshot } from "@/game/fog/FogTypes";
import { recomputeVisibility } from "@/game/fog/FOV";

type MapSize = { width: number; height: number };

interface FogGridState {
  // Core
  mapSize: MapSize;
  grid: FogGrid;
  version: number; // bump to trigger subscribers

  // Gameplay
  sources: VisionSource[];
  blockers: LOSBlocker[];

  // Actions (init/resize)
  setMapSize: (size: MapSize, cellSize?: number) => void;

  // Vision sources / blockers
  setSources: (s: VisionSource[]) => void;
  upsertSource: (id: string, s: VisionSource) => void; // by id via external map if needed
  setBlockers: (b: LOSBlocker[]) => void;

  // Manual DM tools
  revealRect: (x: number, y: number, w: number, h: number) => void;
  hideRect: (x: number, y: number, w: number, h: number) => void;

  // FOV recompute
  recompute: () => void;

  // Persistence
  snapshot: () => FogStateSnapshot;
  load: (sn: FogStateSnapshot) => void;

  // Helpers for renderers
  raw: () => Uint8Array;
  cellSize: () => number;
  dims: () => { cols: number; rows: number };
}

const DEFAULT_MAP: MapSize = { width: 1200, height: 800 };
const DEFAULT_CELL = 40; // => 30 x 20 grid (matches 1200x800)

function newGrid(size: MapSize, cellSize: number) {
  const cols = Math.max(1, Math.round(size.width / cellSize));
  const rows = Math.max(1, Math.round(size.height / cellSize));
  const opts: FogGridOptions = { cols, rows, cellSize };
  return new FogGrid(opts);
}

export const useFogGridStore = create<FogGridState>((set, get) => {
  const grid = newGrid(DEFAULT_MAP, DEFAULT_CELL);

  return {
    mapSize: DEFAULT_MAP,
    grid,
    version: 0,

    sources: [],
    blockers: [],

    setMapSize: (size, cellSize = DEFAULT_CELL) => {
      const next = newGrid(size, cellSize);
      set({ mapSize: size, grid: next, version: get().version + 1 });
    },

    setSources: (s) => {
      set({ sources: s });
      get().recompute();
    },

    upsertSource: (_id, s) => {
      // If you maintain ids externally, merge/update here; for now just replace singleton
      set({ sources: [s] });
      get().recompute();
    },

    setBlockers: (b) => {
      set({ blockers: b });
      get().recompute();
    },

    revealRect: (x, y, w, h) => {
      const g = get().grid;
      g.revealRect(x, y, w, h);
      set({ version: get().version + 1 });
    },

    hideRect: (x, y, w, h) => {
      const g = get().grid;
      g.hideRect(x, y, w, h);
      set({ version: get().version + 1 });
    },

    recompute: () => {
      const g = get().grid;
      const src = get().sources;
      const blk = get().blockers;
      recomputeVisibility(g, src, blk);
      set({ version: get().version + 1 });
    },

    snapshot: () => get().grid.snapshot(),
    load: (sn) => {
      get().grid.load(sn);
      set({ version: get().version + 1 });
    },

    raw: () => get().grid.raw(),
    cellSize: () => get().grid.cellSize,
    dims: () => ({ cols: get().grid.cols, rows: get().grid.rows }),
  };
});