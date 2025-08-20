import { create } from 'zustand';
import { Token, Initiative, BattleState } from '../stores/battleStore';
import { EventBus } from '../combat-core/EventBus';

export interface CombatAction {
  id: string;
  type: 'attack' | 'spell' | 'move' | 'defend' | 'other';
  actor: string;
  target?: string;
  damage?: number;
  description: string;
  timestamp: Date;
}

export interface Condition {
  id: string;
  name: string;
  description: string;
  duration: number;
  effects: {
    damageModifier?: number;
    speedModifier?: number;
    advantageType?: 'advantage' | 'disadvantage' | 'none';
  };
}

export interface CombatLog {
  id: string;
  round: number;
  turn: number;
  actions: CombatAction[];
  timestamp: Date;
}

interface CombatStore {
  // State
  isInCombat: boolean;
  currentRound: number;
  currentTurn: number;
  initiative: Initiative[];
  combatLog: CombatLog[];
  conditions: Map<string, Condition[]>; // tokenId -> conditions
  tokens: Token[];
  activeIdx: number;
  bus: EventBus;
  cfg: { tileSize: number };
  
  // Actions
  startCombat: (tokens: Token[]) => void;
  endCombat: () => void;
  nextTurn: () => void;
  previousTurn: () => void;
  rollInitiative: (tokenId: string) => number;
  addAction: (action: Omit<CombatAction, 'id' | 'timestamp'>) => void;
  addCondition: (tokenId: string, condition: Condition) => void;
  removeCondition: (tokenId: string, conditionId: string) => void;
  updateConditionDuration: (tokenId: string, conditionId: string, duration: number) => void;
  getCurrentToken: () => Initiative | null;
  getTokenConditions: (tokenId: string) => Condition[];
  clearLog: () => void;
  updateToken: (tokenId: number, updates: Partial<Token>) => void;
}

export const useCombatStore = create<CombatStore>((set, get) => ({
  isInCombat: false,
  currentRound: 1,
  currentTurn: 0,
  initiative: [],
  combatLog: [],
  conditions: new Map(),
  tokens: [],
  activeIdx: 0,
  bus: new EventBus(),
  cfg: { tileSize: 5 },

  startCombat: (tokens: Token[]) => {
    const initiative = tokens.map((token, index) => ({
      id: Date.now() + index,
      tokenId: token.id,
      name: token.name,
      roll: Math.floor(Math.random() * 20) + 1,
      isActive: false
    })).sort((a, b) => b.roll - a.roll);

    if (initiative.length > 0) {
      initiative[0].isActive = true;
    }

    set({
      isInCombat: true,
      currentRound: 1,
      currentTurn: 0,
      initiative,
      combatLog: [],
      conditions: new Map()
    });
  },

  endCombat: () => {
    set({
      isInCombat: false,
      currentRound: 1,
      currentTurn: 0,
      initiative: [],
      conditions: new Map()
    });
  },

  nextTurn: () => {
    const { initiative, currentTurn, currentRound } = get();
    
    if (initiative.length === 0) return;

    const newTurn = (currentTurn + 1) % initiative.length;
    const newRound = newTurn === 0 ? currentRound + 1 : currentRound;

    // Update active status
    const updatedInitiative = initiative.map((init, index) => ({
      ...init,
      isActive: index === newTurn
    }));

    // Update condition durations at end of round
    if (newTurn === 0) {
      const { conditions } = get();
      const updatedConditions = new Map();
      
      conditions.forEach((tokenConditions, tokenId) => {
        const activeConditions = tokenConditions
          .map(condition => ({
            ...condition,
            duration: condition.duration - 1
          }))
          .filter(condition => condition.duration > 0);
        
        if (activeConditions.length > 0) {
          updatedConditions.set(tokenId, activeConditions);
        }
      });

      set({
        currentTurn: newTurn,
        currentRound: newRound,
        initiative: updatedInitiative,
        conditions: updatedConditions
      });
    } else {
      set({
        currentTurn: newTurn,
        initiative: updatedInitiative
      });
    }
  },

  previousTurn: () => {
    const { initiative, currentTurn, currentRound } = get();
    
    if (initiative.length === 0) return;

    const newTurn = currentTurn === 0 ? initiative.length - 1 : currentTurn - 1;
    const newRound = currentTurn === 0 ? Math.max(1, currentRound - 1) : currentRound;

    const updatedInitiative = initiative.map((init, index) => ({
      ...init,
      isActive: index === newTurn
    }));

    set({
      currentTurn: newTurn,
      currentRound: newRound,
      initiative: updatedInitiative
    });
  },

  rollInitiative: (tokenId: string) => {
    const roll = Math.floor(Math.random() * 20) + 1;
    const { initiative } = get();
    
    const updatedInitiative = initiative.map(init => 
      init.tokenId === parseInt(tokenId)
        ? { ...init, roll }
        : init
    ).sort((a, b) => b.roll - a.roll);

    // Reset active status
    const resetInitiative = updatedInitiative.map((init, index) => ({
      ...init,
      isActive: index === 0
    }));

    set({
      initiative: resetInitiative,
      currentTurn: 0
    });

    return roll;
  },

  addAction: (action) => {
    const { combatLog, currentRound, currentTurn } = get();
    const actionId = `action_${Date.now()}_${Math.random()}`;
    
    const newAction: CombatAction = {
      ...action,
      id: actionId,
      timestamp: new Date()
    };

    const existingLogIndex = combatLog.findIndex(
      log => log.round === currentRound && log.turn === currentTurn
    );

    if (existingLogIndex >= 0) {
      const updatedLog = [...combatLog];
      updatedLog[existingLogIndex] = {
        ...updatedLog[existingLogIndex],
        actions: [...updatedLog[existingLogIndex].actions, newAction]
      };
      set({ combatLog: updatedLog });
    } else {
      const newLogEntry: CombatLog = {
        id: `log_${currentRound}_${currentTurn}`,
        round: currentRound,
        turn: currentTurn,
        actions: [newAction],
        timestamp: new Date()
      };
      set({ combatLog: [...combatLog, newLogEntry] });
    }
  },

  addCondition: (tokenId, condition) => {
    const { conditions } = get();
    const tokenConditions = conditions.get(tokenId) || [];
    
    // Avoid duplicate conditions
    const existingCondition = tokenConditions.find(c => c.name === condition.name);
    if (existingCondition) {
      return;
    }

    const updatedConditions = new Map(conditions);
    updatedConditions.set(tokenId, [...tokenConditions, condition]);
    set({ conditions: updatedConditions });
  },

  removeCondition: (tokenId, conditionId) => {
    const { conditions } = get();
    const tokenConditions = conditions.get(tokenId) || [];
    
    const updatedTokenConditions = tokenConditions.filter(c => c.id !== conditionId);
    const updatedConditions = new Map(conditions);
    
    if (updatedTokenConditions.length > 0) {
      updatedConditions.set(tokenId, updatedTokenConditions);
    } else {
      updatedConditions.delete(tokenId);
    }
    
    set({ conditions: updatedConditions });
  },

  updateConditionDuration: (tokenId, conditionId, duration) => {
    const { conditions } = get();
    const tokenConditions = conditions.get(tokenId) || [];
    
    const updatedTokenConditions = tokenConditions.map(condition =>
      condition.id === conditionId
        ? { ...condition, duration }
        : condition
    );

    const updatedConditions = new Map(conditions);
    updatedConditions.set(tokenId, updatedTokenConditions);
    set({ conditions: updatedConditions });
  },

  getCurrentToken: () => {
    const { initiative, currentTurn } = get();
    return initiative[currentTurn] || null;
  },

  getTokenConditions: (tokenId) => {
    const { conditions } = get();
    return conditions.get(tokenId) || [];
  },

  clearLog: () => {
    set({ combatLog: [] });
  },

  updateToken: (tokenId: number, updates: Partial<Token>) => {
    const { tokens } = get();
    const updatedTokens = tokens.map(token => 
      token.id === tokenId ? { ...token, ...updates } : token
    );
    set({ tokens: updatedTokens });
  }
}));