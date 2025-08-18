import { create } from "zustand";

export type BrickType = "floor" | "wall" | "stairs" | "pillar" | "roof" | "prop";

export type Brick = {
  id: string;
  t: BrickType;
  // позиция в "стадах" (целые координаты)
  x: number; 
  y: number; 
  z: number;
  rot: 0 | 90 | 180 | 270;
  color?: string;   // для покраски
};

export type Blueprint = { 
  version: 1; 
  studs: number; 
  bricks: Brick[] 
};

type Mode = "place" | "remove" | "paint";
type Kit = "stone_keep" | "village_wood" | "ruins";

type WorldState = {
  studs: number;                  // размер клеток, напр. 1
  bricks: Brick[];
  mode: Mode;
  activeType: BrickType;
  activeRot: 0|90|180|270;
  activeColor?: string;
  kit: Kit;
  occupied: Set<string>;          // "x:y:z" для быстрого конфликта
  undo: Brick[][];
  redo: Brick[][];
  currentHeight: number;          // текущий y-уровень для размещения
  
  // Actions
  setMode: (m: Mode) => void;
  setType: (t: BrickType) => void;
  setHeight: (h: number) => void;
  rotateCW: () => void;
  placeAt: (x:number,y:number,z:number) => void;
  removeAt: (x:number,y:number,z:number) => void;
  canPlace: (x:number,y:number,z:number, t?:BrickType) => boolean;
  exportBlueprint: () => Blueprint;
  importBlueprint: (bp: Blueprint) => void;
  clear: () => void;
  undoAction: () => void;
  redoAction: () => void;
};

const key = (x:number,y:number,z:number) => `${x}:${y}:${z}`;

export const useWorldStore = create<WorldState>((set, get) => ({
  studs: 1,
  bricks: [],
  mode: "place",
  activeType: "wall",
  activeRot: 0,
  kit: "stone_keep",
  occupied: new Set(),
  undo: [],
  redo: [],
  currentHeight: 0,

  setMode: (m) => set({ mode: m }),
  setType: (t) => set({ activeType: t }),
  setHeight: (h) => set({ currentHeight: h }),
  rotateCW: () => set(s => ({ activeRot: ((s.activeRot + 90) % 360) as 0|90|180|270 })),

  canPlace: (x,y,z, t) => {
    const occ = get().occupied;
    // простая проверка: 1×1×1 кирпич
    return !occ.has(key(x,y,z));
  },

  placeAt: (x,y,z) => set(s => {
    if (!get().canPlace(x,y,z, s.activeType)) return s;
    const b: Brick = { 
      id: crypto.randomUUID(), 
      t: s.activeType, 
      x, y, z, 
      rot: s.activeRot, 
      color: s.activeColor 
    };
    const next = [...s.bricks, b];
    const occ = new Set(s.occupied); 
    occ.add(key(x,y,z));
    return { 
      bricks: next, 
      occupied: occ, 
      undo: [...s.undo, s.bricks], 
      redo: [] 
    };
  }),

  removeAt: (x,y,z) => set(s => {
    const idx = s.bricks.findIndex(b => b.x===x && b.y===y && b.z===z);
    if (idx < 0) return s;
    const b = s.bricks[idx];
    const next = s.bricks.slice(0,idx).concat(s.bricks.slice(idx+1));
    const occ = new Set(s.occupied); 
    occ.delete(key(b.x,b.y,b.z));
    return { 
      bricks: next, 
      occupied: occ, 
      undo: [...s.undo, s.bricks], 
      redo: [] 
    };
  }),

  exportBlueprint: () => ({ 
    version: 1, 
    studs: get().studs, 
    bricks: get().bricks 
  }),
  
  importBlueprint: (bp) => set(() => {
    const occ = new Set<string>();
    bp.bricks.forEach(b => occ.add(key(b.x,b.y,b.z)));
    return { 
      studs: bp.studs, 
      bricks: bp.bricks, 
      occupied: occ, 
      undo: [], 
      redo: [] 
    };
  }),

  clear: () => set({ 
    bricks: [], 
    occupied: new Set(), 
    undo: [], 
    redo: [] 
  }),

  undoAction: () => set(s => {
    if (s.undo.length === 0) return s;
    const prev = s.undo[s.undo.length - 1];
    const occ = new Set<string>();
    prev.forEach(b => occ.add(key(b.x,b.y,b.z)));
    return {
      bricks: prev,
      occupied: occ,
      undo: s.undo.slice(0, -1),
      redo: [...s.redo, s.bricks]
    };
  }),

  redoAction: () => set(s => {
    if (s.redo.length === 0) return s;
    const next = s.redo[s.redo.length - 1];
    const occ = new Set<string>();
    next.forEach(b => occ.add(key(b.x,b.y,b.z)));
    return {
      bricks: next,
      occupied: occ,
      undo: [...s.undo, s.bricks],
      redo: s.redo.slice(0, -1)
    };
  }),
}));