import { create } from 'zustand';

export interface SimpleToken {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;
  size: number;
  hp: number;
  maxHp: number;
  ac: number;
  type: 'player' | 'monster' | 'npc';
  controlledBy: string;
  image?: string;
}

interface SimpleBattleStore {
  tokens: SimpleToken[];
  selectedTokenId: string | null;
  draggedTokenId: string | null;
  mapBackground: string | null;
  gridSize: number;
  showGrid: boolean;
  
  // Actions
  addToken: (token: Omit<SimpleToken, 'id'>) => void;
  updateToken: (id: string, updates: Partial<SimpleToken>) => void;
  removeToken: (id: string) => void;
  selectToken: (id: string | null) => void;
  setDraggedToken: (id: string | null) => void;
  moveToken: (id: string, x: number, y: number) => void;
  setMapBackground: (background: string | null) => void;
  setGridSize: (size: number) => void;
  toggleGrid: () => void;
  clearTokens: () => void;
}

export const useSimpleBattleStore = create<SimpleBattleStore>((set, get) => ({
  tokens: [
    {
      id: 'player1',
      name: 'Human Fighter',
      x: 200,
      y: 200,
      color: '#3b82f6',
      size: 50,
      hp: 45,
      maxHp: 45,
      ac: 18,
      type: 'player',
      controlledBy: 'player1'
    },
    {
      id: 'goblin1',
      name: 'Goblin Scout',
      x: 400,
      y: 300,
      color: '#ef4444',
      size: 40,
      hp: 7,
      maxHp: 12,
      ac: 15,
      type: 'monster',
      controlledBy: 'dm'
    },
    {
      id: 'wizard1',
      name: 'Elf Wizard',
      x: 150,
      y: 350,
      color: '#8b5cf6',
      size: 45,
      hp: 28,
      maxHp: 28,
      ac: 12,
      type: 'player',
      controlledBy: 'player2'
    }
  ],
  selectedTokenId: null,
  draggedTokenId: null,
  mapBackground: null,
  gridSize: 50,
  showGrid: true,

  addToken: (tokenData) => {
    const newToken: SimpleToken = {
      ...tokenData,
      id: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    set((state) => ({
      tokens: [...state.tokens, newToken]
    }));
  },

  updateToken: (id, updates) => {
    set((state) => ({
      tokens: state.tokens.map(token =>
        token.id === id ? { ...token, ...updates } : token
      )
    }));
  },

  removeToken: (id) => {
    set((state) => ({
      tokens: state.tokens.filter(token => token.id !== id),
      selectedTokenId: state.selectedTokenId === id ? null : state.selectedTokenId
    }));
  },

  selectToken: (id) => {
    set({ selectedTokenId: id });
  },

  setDraggedToken: (id) => {
    set({ draggedTokenId: id });
  },

  moveToken: (id, x, y) => {
    set((state) => ({
      tokens: state.tokens.map(token =>
        token.id === id ? { ...token, x, y } : token
      )
    }));
  },

  setMapBackground: (background) => {
    set({ mapBackground: background });
  },

  setGridSize: (size) => {
    set({ gridSize: size });
  },

  toggleGrid: () => {
    set((state) => ({ showGrid: !state.showGrid }));
  },

  clearTokens: () => {
    set({ tokens: [] });
  }
}));