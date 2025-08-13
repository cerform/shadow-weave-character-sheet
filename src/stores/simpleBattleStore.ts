import { create } from 'zustand';

interface Equipment {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'accessory' | 'helmet' | 'boots';
  modelPath?: string;
  stats?: {
    damage?: string;
    ac?: number;
    bonus?: string;
  };
}

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
  monsterType?: string; // Add monster type for 3D models
  equipment?: Equipment[];
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
  setTokens: (tokens: SimpleToken[]) => void;
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
      controlledBy: 'player1',
      monsterType: 'fighter', // Добавляем 3D модель для игрока
      equipment: [
        {
          id: 'sword1',
          name: 'Длинный меч',
          type: 'weapon',
          stats: { damage: '1d8+3' }
        },
        {
          id: 'armor1',
          name: 'Кольчуга',
          type: 'armor',
          stats: { ac: 14 }
        }
      ]
    },
    {
      id: 'goblin1',
      name: 'Гоблин',
      x: 400,
      y: 300,
      color: '#4ade80',
      size: 40,
      hp: 7,
      maxHp: 7,
      ac: 15,
      type: 'monster',
      controlledBy: 'dm',
      monsterType: 'goblin'
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
      controlledBy: 'player2',
      monsterType: 'fighter', // Используем ту же модель для волшебника
      equipment: [
        {
          id: 'staff1',
          name: 'Посох мага',
          type: 'weapon',
          stats: { damage: '1d6+2' }
        },
        {
          id: 'robes1',
          name: 'Мантия мага',
          type: 'armor',
          stats: { ac: 12 }
        }
      ]
    },
    {
      id: 'orc1',
      name: 'Орк',
      x: 600,
      y: 250,
      color: '#22c55e',
      size: 50,
      hp: 15,
      maxHp: 15,
      ac: 13,
      type: 'monster',
      controlledBy: 'dm',
      monsterType: 'orc'
    },
    {
      id: 'skeleton1',
      name: 'Скелет',
      x: 300,
      y: 150,
      color: '#e5e7eb',
      size: 45,
      hp: 13,
      maxHp: 13,
      ac: 13,
      type: 'monster',
      controlledBy: 'dm',
      monsterType: 'skeleton'
    },
    {
      id: 'dragon1',
      name: 'Дракон',
      x: 500,
      y: 400,
      color: '#dc2626',
      size: 80,
      hp: 256,
      maxHp: 256,
      ac: 19,
      type: 'monster',
      controlledBy: 'dm',
      monsterType: 'dragon'
    },
    {
      id: 'wolf1',
      name: 'Волк',
      x: 450,
      y: 150,
      color: '#6b7280',
      size: 45,
      hp: 11,
      maxHp: 11,
      ac: 13,
      type: 'monster',
      controlledBy: 'dm',
      monsterType: 'wolf'
    },
    {
      id: 'golem1',
      name: 'Голем',
      x: 700,
      y: 350,
      color: '#78716c',
      size: 70,
      hp: 178,
      maxHp: 178,
      ac: 17,
      type: 'monster',
      controlledBy: 'dm',
      monsterType: 'golem'
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
    console.log(`🏪 STORE: Moving token ${id} to ${x}, ${y}`);
    set((state) => {
      const newTokens = state.tokens.map(token =>
        token.id === id ? { ...token, x, y } : token
      );
      console.log(`🏪 STORE: Token ${id} updated to`, newTokens.find(t => t.id === id));
      return { tokens: newTokens };
    });
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
  },

  setTokens: (tokens) => {
    set({ tokens });
  }
}));