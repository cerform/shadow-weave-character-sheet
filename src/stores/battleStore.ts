
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Define Initiative interface (export separately from store)
export interface Initiative {
  id: number;
  name: string;
  value: number;
  order: number;
}

export interface Token {
  id: number;
  name: string;
  type: "player" | "monster" | "boss" | "npc";
  x: number;
  y: number;
  size: number;
  hp: number;
  maxHp: number;
  armorClass?: number;
  conditions?: string[];
  image?: string;
  initiative?: number;
  color?: string;
  isVisible?: boolean;
  isActive?: boolean;
}

export interface BattleState {
  tokens: Token[];
  initiative: Initiative[];
  gridSize: number;
  background: string;
  tokenIdCounter: number;
  battleActive: boolean;
  currentTurn: number;
  
  // Actions
  addToken: (token: Token) => void;
  removeToken: (id: number) => void;
  updateTokenPosition: (id: number, x: number, y: number) => void;
  updateTokenHP: (id: number, change: number) => void;
  setBackground: (url: string) => void;
  setGridSize: (size: number) => void;
  setInitiative: (initiatives: Initiative[]) => void;
  setBattleActive: (active: boolean) => void;
  nextTurn: () => void;
  resetTurn: () => void;
}

// Main store creation
export const useBattleStore = create<BattleState>()(
  devtools((set) => ({
    tokens: [],
    initiative: [],
    gridSize: 50,
    background: '',
    tokenIdCounter: 1,
    battleActive: false,
    currentTurn: 0,
    
    addToken: (token) => set((state) => {
      // Make sure token has an id
      const newToken = {
        ...token,
        id: token.id || state.tokenIdCounter
      };
      
      return {
        tokens: [...state.tokens, newToken],
        tokenIdCounter: state.tokenIdCounter + 1
      };
    }),
    
    removeToken: (id) => set((state) => ({
      tokens: state.tokens.filter((token) => token.id !== id),
      initiative: state.initiative.filter((init) => init.id !== id)
    })),
    
    updateTokenPosition: (id, x, y) => set((state) => ({
      tokens: state.tokens.map((token) =>
        token.id === id ? { ...token, x, y } : token
      )
    })),
    
    updateTokenHP: (id, change) => set((state) => ({
      tokens: state.tokens.map((token) =>
        token.id === id
          ? { ...token, hp: Math.max(0, Math.min(token.maxHp, token.hp + change)) }
          : token
      )
    })),
    
    setBackground: (url) => set({ background: url }),
    
    setGridSize: (size) => set({ gridSize: size }),
    
    setInitiative: (initiatives) => set({ initiative: initiatives }),
    
    setBattleActive: (active) => set({ battleActive: active }),
    
    nextTurn: () => set((state) => {
      if (!state.battleActive || state.initiative.length === 0) {
        return { currentTurn: 0 };
      }
      
      const nextTurn = (state.currentTurn + 1) % state.initiative.length;
      return { currentTurn: nextTurn };
    }),
    
    resetTurn: () => set({ currentTurn: 0 }),
  }))
);

// Helper function to get the current active token
export const getCurrentActiveToken = (state: BattleState): Token | undefined => {
  if (!state.battleActive || state.initiative.length === 0) {
    return undefined;
  }
  
  const currentInitiative = state.initiative[state.currentTurn];
  if (!currentInitiative) {
    return undefined;
  }
  
  return state.tokens.find((token) => token.id === currentInitiative.id);
};
