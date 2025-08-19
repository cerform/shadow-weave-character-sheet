import { create } from "zustand";

export type Token = {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  position: [number, number, number]; // x,y,z
  conditions: string[];
  isEnemy?: boolean;
  isVisible?: boolean;
  avatarUrl?: string;
  speed?: number; // Скорость перемещения в клетках за ход
  hasMovedThisTurn?: boolean; // Переместился ли в этом ходу
};

export type CombatEvent = {
  id: string;
  timestamp: number;
  actor: string;
  action: string;
  target?: string;
  damage?: number;
  description: string;
};

type BattleUIState = {
  tokens: Token[];
  activeId: string | null;
  order: string[]; // initiative order of token ids
  fogEnabled: boolean;
  combatLog: CombatEvent[];
  round: number;
  
  // Actions
  setTokens: (t: Token[]) => void;
  updateToken: (id: string, patch: Partial<Token>) => void;
  setInitiative: (order: string[], activeId?: string | null) => void;
  nextTurn: () => void;
  toggleFog: (on?: boolean) => void;
  addCombatEvent: (event: Omit<CombatEvent, 'id' | 'timestamp'>) => void;
  clearCombatLog: () => void;
  moveInInitiative: (fromIndex: number, toIndex: number) => void;
};

export const useBattleUIStore = create<BattleUIState>((set, get) => ({
  tokens: [
    { 
      id: "hero-1", 
      name: "Fighter", 
      hp: 30, 
      maxHp: 40, 
      position: [0, 0, 0], 
      conditions: [],
      isEnemy: false
    },
    { 
      id: "goblin-1", 
      name: "Goblin", 
      hp: 12, 
      maxHp: 12, 
      position: [3, 0, 3], 
      conditions: ["poisoned"], 
      isEnemy: true
    },
    { 
      id: "skeleton-1", 
      name: "Skeleton", 
      hp: 18, 
      maxHp: 18, 
      position: [-2, 0, 4], 
      conditions: ["stunned"], 
      isEnemy: true
    },
  ],
  activeId: "hero-1",
  order: ["hero-1", "goblin-1", "skeleton-1"],
  fogEnabled: true,
  combatLog: [
    {
      id: "1",
      timestamp: Date.now() - 60000,
      actor: "Fighter",
      action: "Attack",
      target: "Goblin",
      damage: 12,
      description: "Fighter attacks Goblin with sword"
    },
    {
      id: "2", 
      timestamp: Date.now() - 30000,
      actor: "Goblin",
      action: "Attack",
      description: "Goblin misses attack on Fighter"
    },
    {
      id: "3",
      timestamp: Date.now() - 10000,
      actor: "Wizard",
      action: "Spell",
      target: "Skeleton",
      damage: 20,
      description: "Wizard casts Fire Bolt on Skeleton"
    }
  ],
  round: 1,

  setTokens: (t) => set({ tokens: t }),
  
  updateToken: (id, patch) =>
    set(({ tokens }) => ({
      tokens: tokens.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    })),
    
  setInitiative: (order, activeId = order[0] ?? null) => set({ order, activeId }),
  
  nextTurn: () => {
    const { order, activeId, round } = get();
    if (!order.length) return;
    const idx = Math.max(0, order.indexOf(activeId ?? order[0]));
    const nextIndex = (idx + 1) % order.length;
    const next = order[nextIndex];
    
    // If we're back to the first character, increment round
    const newRound = nextIndex === 0 ? round + 1 : round;
    
    set({ activeId: next, round: newRound });
  },
  
  toggleFog: (on) => set(({ fogEnabled }) => ({ fogEnabled: on ?? !fogEnabled })),
  
  addCombatEvent: (event) => set(({ combatLog }) => ({
    combatLog: [...combatLog, {
      ...event,
      id: Math.random().toString(36),
      timestamp: Date.now()
    }]
  })),
  
  clearCombatLog: () => set({ combatLog: [] }),
  
  moveInInitiative: (fromIndex, toIndex) => set(({ order, activeId }) => {
    const newOrder = [...order];
    const [movedItem] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, movedItem);
    return { order: newOrder, activeId };
  }),
}));