import { create } from 'zustand';

export interface EnhancedToken {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  ac: number;
  position: [number, number, number];
  conditions: string[];
  isEnemy?: boolean;
  isVisible?: boolean;
  avatarUrl?: string;
  size?: number;
  modelUrl?: string; // URL для 3D модели
}

export interface CombatEvent {
  id: string;
  timestamp: number;
  actor: string;
  action: string;
  target?: string;
  damage?: number;
  description: string;
}

export type FogMode = 'reveal' | 'hide';

interface EnhancedBattleState {
  // Combat state
  tokens: EnhancedToken[];
  activeId: string | null;
  initiativeOrder: string[];
  currentRound: number;
  combatStarted: boolean;
  
  // Fog of war
  fogEnabled: boolean;
  fogBrushSize: number;
  fogMode: FogMode;
  fogEditMode: boolean;
  
  // UI state
  selectedTokenId: string | null;
  showMovementGrid: boolean;
  contextMenu: {
    visible: boolean;
    x: number;
    y: number;
    tokenId: string | null;
  };
  
  // Combat log
  combatLog: CombatEvent[];
  
  // Actions
  setTokens: (tokens: EnhancedToken[]) => void;
  addToken: (token: EnhancedToken) => void;
  removeToken: (id: string) => void;
  updateToken: (id: string, updates: Partial<EnhancedToken>) => void;
  moveToken: (id: string, position: [number, number, number]) => void;
  setTokenVisibility: (id: string, visible: boolean) => void;
  
  // Initiative
  setInitiativeOrder: (order: string[], activeId?: string | null) => void;
  nextTurn: () => void;
  previousTurn: () => void;
  startCombat: () => void;
  endCombat: () => void;
  
  // Fog of war
  toggleFog: (enabled?: boolean) => void;
  setFogBrushSize: (size: number) => void;
  setFogMode: (mode: FogMode) => void;
  setFogEditMode: (editMode: boolean) => void;
  clearFog: () => void;
  
  // UI actions
  selectToken: (id: string | null) => void;
  setShowMovementGrid: (show: boolean) => void;
  showContextMenu: (x: number, y: number, tokenId: string) => void;
  hideContextMenu: () => void;
  
  // Combat log
  addCombatEvent: (event: Omit<CombatEvent, 'id' | 'timestamp'>) => void;
  clearCombatLog: () => void;
}

export const useEnhancedBattleStore = create<EnhancedBattleState>((set, get) => ({
  // Initial state
  tokens: [
    {
      id: 'hero-1',
      name: 'Воин',
      hp: 30,
      maxHp: 40,
      ac: 18,
      position: [0, 0, 0],
      conditions: [],
      isVisible: true,
      isEnemy: false,
    },
    {
      id: 'goblin-1',
      name: 'Гоблин',
      hp: 12,
      maxHp: 12,
      ac: 14,
      position: [3, 0, 3],
      conditions: ['отравлен'],
      isEnemy: true,
      isVisible: true,
    },
  ],
  activeId: 'hero-1',
  initiativeOrder: ['hero-1', 'goblin-1'],
  currentRound: 1,
  combatStarted: true,
  
  fogEnabled: false, // Выключаем по умолчанию чтобы не блокировать UI
  fogBrushSize: 60,
  fogMode: 'reveal',
  fogEditMode: false,
  
  selectedTokenId: null,
  showMovementGrid: false,
  contextMenu: {
    visible: false,
    x: 0,
    y: 0,
    tokenId: null,
  },
  
  combatLog: [],
  
  // Actions
  setTokens: (tokens) => set({ tokens }),
  
  addToken: (token) =>
    set((state) => ({
      tokens: [...state.tokens, token],
    })),
    
  removeToken: (id) =>
    set((state) => ({
      tokens: state.tokens.filter((token) => token.id !== id),
    })),
  
  updateToken: (id, updates) =>
    set((state) => ({
      tokens: state.tokens.map((token) =>
        token.id === id ? { ...token, ...updates } : token
      ),
    })),
    
  moveToken: (id: string, position: [number, number, number]) =>
    set((state) => ({
      tokens: state.tokens.map((token) =>
        token.id === id ? { ...token, position } : token
      ),
    })),
    
  setTokenVisibility: (id, visible) =>
    set((state) => ({
      tokens: state.tokens.map((token) =>
        token.id === id ? { ...token, isVisible: visible } : token
      ),
    })),
    
  // Initiative
  setInitiativeOrder: (order, activeId = order[0] ?? null) =>
    set({ initiativeOrder: order, activeId }),
    
  nextTurn: () => {
    const { initiativeOrder, activeId } = get();
    if (!initiativeOrder.length) return;
    
    const currentIndex = Math.max(0, initiativeOrder.indexOf(activeId ?? initiativeOrder[0]));
    const nextIndex = (currentIndex + 1) % initiativeOrder.length;
    const nextId = initiativeOrder[nextIndex];
    
    // If we've gone through all characters, increment round
    if (nextIndex === 0) {
      set((state) => ({
        activeId: nextId,
        currentRound: state.currentRound + 1,
      }));
    } else {
      set({ activeId: nextId });
    }
  },
  
  previousTurn: () => {
    const { initiativeOrder, activeId } = get();
    if (!initiativeOrder.length) return;
    
    const currentIndex = Math.max(0, initiativeOrder.indexOf(activeId ?? initiativeOrder[0]));
    const prevIndex = currentIndex === 0 ? initiativeOrder.length - 1 : currentIndex - 1;
    const prevId = initiativeOrder[prevIndex];
    
    // If we've gone to the last character, decrement round
    if (currentIndex === 0) {
      set((state) => ({
        activeId: prevId,
        currentRound: Math.max(1, state.currentRound - 1),
      }));
    } else {
      set({ activeId: prevId });
    }
  },
  
  startCombat: () => set({ combatStarted: true }),
  endCombat: () => set({ combatStarted: false, activeId: null }),
  
  // Fog of war
  toggleFog: (enabled) =>
    set((state) => ({ fogEnabled: enabled ?? !state.fogEnabled })),
    
  setFogBrushSize: (size) =>
    set({ fogBrushSize: Math.max(10, Math.min(120, size)) }),
    
  setFogMode: (mode) => set({ fogMode: mode }),
  
  setFogEditMode: (editMode) => set({ fogEditMode: editMode }),
  
  clearFog: () => set({}), // Функция для очистки тумана - будет обрабатываться в компоненте
  
  // UI actions
  selectToken: (id) => set({ selectedTokenId: id }),
  
  setShowMovementGrid: (show) => set({ showMovementGrid: show }),
  
  showContextMenu: (x, y, tokenId) =>
    set({
      contextMenu: { visible: true, x, y, tokenId },
    }),
    
  hideContextMenu: () =>
    set({
      contextMenu: { visible: false, x: 0, y: 0, tokenId: null },
    }),
    
  // Combat log
  addCombatEvent: (event) => {
    const newEvent: CombatEvent = {
      ...event,
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    
    set((state) => ({
      combatLog: [newEvent, ...state.combatLog].slice(0, 50), // Keep last 50 events
    }));
  },
  
  clearCombatLog: () => set({ combatLog: [] }),
}));